import { EventList, IEventHandler } from 'ste-events';
import { ClickEvent } from './definitions/click-event';
import { CueEvent } from './definitions/cue-event';
import { isTimer, ITimer } from './definitions/timer';
import { BasicTimer } from './basic-timer';
import { CueSequenceLean } from './definitions/cue-sequence';
import { separateCueSequence } from './cue-utils';
import { BaseClickTrackOptions, ClickTrackOptionVariants } from './definitions/click-track-options';
import { EventTypeMap } from './definitions/click-track-event-names';
import { UniversalTimer } from './universal-timer';

// C represents the type of data to be used for cue events
export class ClickTrack<C = any> {
  readonly tempo: number = 60;
  private tempoBPS: number = 1;
  readonly beats: number = 4;
  readonly offset: number = 0;
  readonly length: number = Infinity;
  readonly timer: ITimer;
  private cues: CueSequenceLean = [];
  private cueData: Array<C> = [];
  private currentBeat: number = -1;
  private previousBeat: number = -1;
  private currentCue: number = -1;
  private previousCue: number = -1;
  private events = new EventList<this, any>();

  constructor(options: BaseClickTrackOptions<C> & ClickTrackOptionVariants) {

    if(options.tempo !== undefined) {
      // Validate tempo
      if(options.tempo === 0 || options.tempo < 0) {
        throw new Error(`Invalid tempo (${options.tempo}), must be greater than 0.`);
      }
      this.tempo = options.tempo;
      this.tempoBPS = this.tempo / 60;
    }

    if(options.beats !== undefined) {
      this.beats = options.beats;
    }

    if(options.offset !== undefined) {
      this.offset = options.offset;
    }

    // Setup cues and cue data
    if(options.cues !== undefined) {
      const [cueLean, cueData] = separateCueSequence<C>(options.cues);
      this.cues = cueLean;
      this.cueData = cueData;
    }

    if(isTimer(options.timerSource)) {
      // Custom timer
      this.timer = options.timerSource;
      this.length = Infinity;

    } else if(options.timerSource === undefined) {
      // Basic timer
      this.timer = new BasicTimer(options.autostart, options.length, options.loop);
      if(options.length !== undefined) {
        this.length = options.length;
      }

    } else if(typeof options.timerSource === "function") {
      this.timer = new UniversalTimer(options.timerSource);

    } else {
      throw new Error('Constructing ClickTrack: Unknown value type for timerSource option.');

    }

    this.timer.onUpdate(this.setTime.bind(this));
  }

  private dispatch<K extends Extract<keyof EventTypeMap<C>, string>>(event: K, arg: EventTypeMap<C>[K]) {
    this.events.get(event).dispatchAsync(this, arg);
  }

  // Adds event listener
  on<K extends Extract<keyof EventTypeMap<C>, string>>(event: K, fn: IEventHandler<this, EventTypeMap<C>[K]>): void {
    this.events.get(event).subscribe(fn);
  }

  // Removes event listener
  off<K extends Extract<keyof EventTypeMap<C>, string>>(event: K, fn: IEventHandler<this, EventTypeMap<C>[K]>): void {
    this.events.get(event).unsubscribe(fn);
  }

  // Sets the time in seconds
  setTime(timer: ITimer, time: number): void {

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
        this.cues[calcCue] < this.currentBeat && calcCue < this.cues.length;
        // Increment by one
        calcCue++
      );
      // Subtract 1 to get the current cue index
      calcCue -=1;

      // Set previous cue pointer before changing current cue
      this.previousCue = this.currentCue;
      // Set current
      this.currentCue = calcCue;

      // Traverse each cue from last 'til current
      if(this.currentCue !== -1 && this.currentCue !== this.previousCue) {
        for(let i = this.previousCue + 1; i <= this.currentCue; i++) {
          const cueData: C | null = this.cueData[i] || null;
          const time = this.cues[i] / this.tempoBPS;
          const event: CueEvent<C> = {
            time,
            beat: this.cues[i],
            data: cueData,
            cue: i,
            drag: this.currentBeat - this.cues[i],
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
        drag: toBeat - i,
      });
    }

    return clickEvents;

  }
}