import { EventList, IEventHandler } from 'ste-events';
import { Click } from './definitions/click';
import { ClickEvent } from './definitions/click-event';
import { CueEvent } from './definitions/cue-event';
import { ITimer, isTimer } from './definitions/timer';
import { MediaTimer } from './media-timer';
import { BasicTimer } from './basic-timer';
import { YTPlayer, isYTPlayer, YTTimer } from './youtube-timer';
import { CueSequence } from './definitions/cue-sequence';

type BaseClickTrackOptions = {
  tempo: number;
  cues?: CueSequence;
  offset?: number;
  beats?: number;
}

type ClickTrackOptionVariants = {
  timerSource: HTMLMediaElement,
} | {
  timerSource: undefined,
  autostart?: boolean,
  length?: number;
  loop?: boolean;
} | {
  timerSource: ITimer,
} | {
  timerSource: YTPlayer,
}

type ClickTrackOptions = BaseClickTrackOptions & ClickTrackOptionVariants;

type ClickTrackEventClickName = "beat";// | "bar" | "track" | "start" | "stop";
type ClickTrackEventCueName = "cue";
type ClickTrackEventName = ClickTrackEventClickName | ClickTrackEventCueName;

export class ClickTrack {
  tempo: number;
  beats: number;
  offset: number;
  length: number;
  cues?: CueSequence;
  private currentBeat: number;
  private previousBeat: number;
  private previousCue: number;
  private currentCue: number;
  private tempoBPS: number = 0;
  private events = new EventList<ClickTrack, CueEvent | ClickEvent>();

  constructor(options: ClickTrackOptions) {

    // Validate options
    if(options.tempo === 0 || options.tempo < 0) {
      throw new Error(`Invalid tempo (${options.tempo}), must be greater than 0.`);
    }

    // Assign options and defaults
    this.tempo = options.tempo;
    this.beats = options.beats || 4;
    this.offset = options.offset || 0;

    // @TODO - update this if this.tempo changes
    this.tempoBPS = this.tempo / 60;

    if(options.cues) {
      this.cues = options.cues;
    }
    this.currentCue = this.previousCue = -1;
    this.currentBeat = this.previousBeat = -1;

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
  private dispatch(event: ClickTrackEventCueName, arg: CueEvent): void;
  private dispatch(event: ClickTrackEventName, arg: ClickEvent | CueEvent): void {
    this.events.get(event).dispatchAsync(this, arg);
  }

  // Adds event listener
  on(event: ClickTrackEventClickName, fn: IEventHandler<ClickTrack, ClickEvent>): void;
  on(event: ClickTrackEventCueName, fn: IEventHandler<ClickTrack, CueEvent>): void;
  on(event: ClickTrackEventName, fn: CallableFunction): void {
    // @TODO - avoid type assertion here.
    this.events.get(event).subscribe(fn as IEventHandler<ClickTrack, CueEvent | ClickEvent>);
  }

  // Removes event listener
  off(event: ClickTrackEventClickName, fn: IEventHandler<ClickTrack, ClickEvent>): void;
  off(event: ClickTrackEventCueName, fn: IEventHandler<ClickTrack, CueEvent>): void;
  off(event: ClickTrackEventName, fn: CallableFunction): void {
    // @TODO - avoid type assertion here.
    this.events.get(event).unsubscribe(fn as IEventHandler<ClickTrack, CueEvent | ClickEvent>);
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
          const cueEvent = {
            time: this.cues[i],
            cueIndex: i,
            timeDifference: offsetTime - this.cues[i],
          };
          this.dispatch("cue", cueEvent);
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