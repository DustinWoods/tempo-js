import { EventList, IEventHandler } from 'ste-events';
import { ClickEvent } from './definitions/click-event';
import { CueEvent } from './definitions/cue-event';
import { isTimer } from './definitions/timer';
import { MediaTimer } from './media-timer';
import { BasicTimer } from './basic-timer';
import { isYTPlayer, YTTimer } from './youtube-timer';
import { CueSequenceLean } from './definitions/cue-sequence';
import { separateCueSequence } from './cue-utils';
import { BaseClickTrackOptions, ClickTrackOptionVariants } from './definitions/click-track-options';
import { ClickTrackEventClickName, ClickTrackEventName, ClickTrackEventCueName } from './definitions/click-track-event-names';

export class ClickTrack<C = any> {
  readonly tempo: number;
  readonly beats: number = 4;
  readonly offset: number = 0;
  readonly length: number = Infinity;
  private cues: CueSequenceLean = [];
  private cueData: Array<C> = [];
  private currentBeat: number = -1;
  private previousBeat: number = -1;
  private currentCue: number = -1;
  private previousCue: number = -1;
  private tempoBPS: number = 0;
  private events = new EventList<ClickTrack<C>, CueEvent<C> | ClickEvent>();

  constructor(options: BaseClickTrackOptions<C> & ClickTrackOptionVariants) {

    // Validate tempo
    if(options.tempo === 0 || options.tempo < 0) {
      throw new Error(`Invalid tempo (${options.tempo}), must be greater than 0.`);
    }

    this.tempo = options.tempo;
    this.tempoBPS = this.tempo / 60;

    if(options.beats) {
      this.beats = options.beats;
    }

    if(options.offset) {
      this.offset = options.offset;
    }

    // Setup cues and cue data
    if(options.cues) {
      const [cueLean, cueData] = separateCueSequence<C>(options.cues);
      this.cues = cueLean;
      this.cueData = cueData;
    }

    if(isTimer(options.timerSource)) {
      // Custom timer
      options.timerSource.onUpdate(this.setTime.bind(this));
      this.length = Infinity;

    } else if(options.timerSource === undefined) {
      // Basic timer
      const timer = new BasicTimer(options.autostart, options.length, options.loop);
      timer.onUpdate(this.setTime.bind(this));
      this.length = options.length || Infinity;

    } else if(isYTPlayer(options.timerSource)) {
      // YouTube Timer for YouTube iFrame API player
      const timer = new YTTimer(options.timerSource);
      timer.onUpdate(this.setTime.bind(this));
      this.length = options.timerSource.getDuration();

    } else {
      // Media Timer (for Audio/Video)
      // @TODO - listen for timerSource destroy and remove listener
      const timer = new MediaTimer(options.timerSource);
      timer.onUpdate(this.setTime.bind(this));
      this.length = options.timerSource.duration;

    }
  }

  private dispatch(event: ClickTrackEventClickName, arg: ClickEvent): void;
  private dispatch(event: ClickTrackEventCueName, arg: CueEvent<C>): void;
  private dispatch(event: ClickTrackEventName, arg: ClickEvent | CueEvent<C>): void {
    this.events.get(event).dispatchAsync(this, arg);
  }

  // Adds event listener
  on(event: ClickTrackEventClickName, fn: IEventHandler<ClickTrack<C>, ClickEvent>): void;
  on(event: ClickTrackEventCueName, fn: IEventHandler<ClickTrack<C>, CueEvent<C>>): void;
  on(event: ClickTrackEventName, fn: CallableFunction): void {
    // @TODO - avoid type assertion here.
    this.events.get(event).subscribe(fn as IEventHandler<ClickTrack<C>, CueEvent<C> | ClickEvent>);
  }

  // Removes event listener
  off(event: ClickTrackEventClickName, fn: IEventHandler<ClickTrack<C>, ClickEvent>): void;
  off(event: ClickTrackEventCueName, fn: IEventHandler<ClickTrack<C>, CueEvent<C>>): void;
  off(event: ClickTrackEventName, fn: CallableFunction): void {
    // @TODO - avoid type assertion here.
    this.events.get(event).unsubscribe(fn as IEventHandler<ClickTrack<C>, CueEvent<C> | ClickEvent>);
  }

  // Sets the time in seconds
  setTime(time: number): void {

    // Adjust for offset
    const offsetTime = time - this.offset;

    // Set previous click pointer to current click before we change current click
    this.previousBeat = this.currentBeat;
    // Calculate current beat
    this.currentBeat = offsetTime * this.tempoBPS;

    // Get all events that occurred between prior click and current click
    const clickEvents = this.getClickEvents(this.previousBeat, this.currentBeat, offsetTime);

    // Loop through clicksBetween and dispatch
    for(let i = 0; i < clickEvents.length; i++) {
      this.dispatch("beat", clickEvents[i]);
    }

    if(this.cues) {

      // Where the calculated cue index will be stored
      let calcCue: number;
      // This for loop will set calcCue to the index of the next cue
      for(
        // Start iteration at current cue marker, but if less than 0 (-1) then start counter at 0
        calcCue = Math.max(0, this.currentCue);
        // Iterate until cue marker is greater than current time, or until no more cues
        this.cues[calcCue] < offsetTime && calcCue < this.cues.length;
        // Increment by one
        calcCue++
      );
      // Subtract 1 to get the current cue index
      calcCue -=1;

      // Set previous cue pointer before changing current cue
      this.previousCue = this.currentCue;
      // Set current
      this.currentCue = calcCue;

      if(this.currentCue !== -1 && this.currentCue !== this.previousCue) {
        for(let i = this.previousCue + 1; i <= this.currentCue; i++) {
          const cueData: C | null = this.cueData[i] || null;
          const event: CueEvent<C> = {
            time: this.cues[i],
            data: cueData,
            cueIndex: i,
            timeDifference: offsetTime - this.cues[i],
          };
          this.dispatch("cue", event);
        }
      }
    }
  }

  private getClickEvents(fromBeat: number, toBeat: number, toTime: number): Array<ClickEvent> {

    if(fromBeat > toBeat) {
      // @TODO - check if track has looped on itself
      return [];
    }

    // Beats are the same
    if(fromBeat === toBeat) {
      return [];
    }

    const fromBeatInt = Math.max(0, Math.ceil(fromBeat));
    const toBeatInt = Math.floor(toBeat);

    // Beat hasn't advanced a whole number yet
    if(fromBeatInt > toBeatInt) {
      return [];
    }

    const clickEvents: Array<ClickEvent> = [];

    for (let i = fromBeatInt; i <= toBeatInt; i++) {
      const time = i / this.tempoBPS;
      clickEvents.push({
        time: time,
        beat: i,
        bar: Math.floor(i / this.beats),
        beatBar: ((i / this.beats) % 1) * this.beats,
        timeDifference: toTime - time,
        beatDifference: toBeat - i,
      });
    }

    return clickEvents;

  }
}