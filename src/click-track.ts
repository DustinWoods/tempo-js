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

    // Setup timer
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
      // universal timer using function
      this.timer = new UniversalTimer(options.timerSource);

    } else {
      throw new Error('Constructing ClickTrack: Unknown value type for timerSource option.');

    }

    // Bind the tick event
    this.timer.onUpdate(this.setTime.bind(this));
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

    // Process beat events only if listeners are listening
    if(this.events.get("beat").count) {
      // Get all events that occurred between prior click and current click
      const clickEvents = this.getClickEvents(this.previousBeat, this.currentBeat, offsetTime);

      // Loop through clicksBetween and dispatch
      for(let i = 0; i < clickEvents.length; i++) {
        this.events.get("beat").dispatchAsync(this, clickEvents[i]);
      }
    }

    // Process cue events only if cues exist and listeners are listening
    if(this.cues && this.events.get("cue").count) {

      // Start scanning for current cue from previous cue, only if track moved forward. Otherwise scan from the beginning.
      const calcCueFrom = this.currentBeat > this.previousBeat ? this.previousCue : 0;
      // Calculate current cue
      const newCurrentCue = this.getCurrentCue(this.currentBeat, calcCueFrom);
      // Set previous cue pointer before changing current cue
      this.previousCue = this.currentCue;
      // Set current cue
      this.currentCue = newCurrentCue;

      // Get all cue events that occurred between previous cue and current cue
      const cueEvents = this.getCueEvents(this.previousCue, this.currentCue, this.currentBeat);

      // Loop through clicksBetween and dispatch
      for(let i = 0; i < cueEvents.length; i++) {
        this.events.get("cue").dispatchAsync(this, cueEvents[i]);
      }
    }
  }

  // Determines the current cue marker based on the current beat
  private getCurrentCue(currentBeat: number, startSearchAt: number): number {
    // Where the calculated cue index will be stored
    let calcCue: number;
    // This for loop will set calcCue to the index of the next cue
    for(
      // Start iteration at current cue marker, but if less than 0 (-1) then start counter at 0
      calcCue = Math.max(0, startSearchAt);
      // Iterate until cue marker is greater than current time, or until no more cues
      this.cues[calcCue] < currentBeat && calcCue < this.cues.length;
      // Increment by one
      calcCue++
    );
    // Subtract 1 to get the current cue index
    calcCue -=1;

    return calcCue;
  }

  private getCueEvents(fromCue:number, toCue: number, currentBeat: number): Array<CueEvent<C>> {

    // At the beginning
    if(toCue === -1) {
      return [];
    }

    // Nothing changed
    if(toCue === fromCue) {
      return [];
    }

    // Moved backwards
    if(toCue < fromCue) {
      return [];
    }

    // Traverse each cue from last 'til current
    const events:Array<CueEvent<C>> = [];
    for(let i = fromCue + 1; i <= toCue; i++) {
      const cueData: C | null = this.cueData[i] || null;
      const time = this.cues[i] / this.tempoBPS;
      const event: CueEvent<C> = {
        time,
        beat: this.cues[i],
        data: cueData,
        cue: i,
        drag: currentBeat - this.cues[i],
      };
      events.push(event);
    }

    return events;
  }

  private getClickEvents(fromBeat: number, toBeat: number, toTime: number): Array<ClickEvent> {

    // We are assuming a backwards scrub happened, so we won't produce any events
    // In some cases, this might mean we looped back to the beginning.
    if(fromBeat > toBeat) {
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