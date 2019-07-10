import { EventList, IEventHandler } from 'ste-events';
import { Click } from './definitions/click';
import { ClickEvent } from './definitions/click-event';
import { ITimer, isTimer } from './definitions/timer';
import { MediaTimer } from './media-timer';
import { BasicTimer } from './basic-timer';
import { YTPlayer, isYTPlayer, YTTimer } from './youtube-timer';

type BaseClickTrackOptions = {
  tempo: number;
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

type ClickTrackEventName = "beat";// | "bar" | "track" | "start" | "stop";

export class ClickTrack {
  tempo: number;
  beats: number;
  offset: number;
  length: number;
  currentClick: Click;
  private previousClick: Click;
  private tempoBPS: number = 0;
  private events = new EventList<ClickTrack, ClickEvent>();

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

    this.currentClick = this.previousClick = {
      beat: 0,
      bar: 0,
      time: 0,
      beatBar: 0,
    };

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

  private dispatch(event: ClickTrackEventName, arg: ClickEvent) {
    this.events.get(event).dispatch(this, arg);
  }

  // Adds event listener
  on(event: ClickTrackEventName, fn: IEventHandler<ClickTrack, ClickEvent>): void {
    this.events.get(event).subscribe(fn);
  }

  // Removes event listener
  off(event: ClickTrackEventName, fn: IEventHandler<ClickTrack, ClickEvent>): void {
    this.events.get(event).unsubscribe(fn);
  }

  // Sets the time in seconds
  setTime(time: number): void {

    const offsetTime = time - this.offset;

    // Calculate current click
    const beat = offsetTime * this.tempoBPS;
    const bar = beat / this.beats;
    const beatBar = beat % this.beats;

    // Set previous click pointer to current click before we change current click
    this.previousClick = this.currentClick;
    this.currentClick = {
      time: offsetTime,
      beat,
      bar,
      beatBar,
    };

    // @TODO check if set time is looped around ending
    // @TODO check if at end, and needing to stop

    // Get all events that occurred between prior click and current click
    const clicksBetween = this.getClicksBetween(this.previousClick, this.currentClick);

    // Loop through clicksBetween and dispatch
    for(let i = 0; i < clicksBetween.length; i++) {
      this.dispatch("beat", clicksBetween[i]);
    }
  }

  private getClicksBetween(fromClick: Click, toClick: Click): Array<ClickEvent> {

    if(fromClick.beat > toClick.beat) {
      // @TODO - check if track has looped on itself
      //throw new Error('Implement calculating clicks for looped track');
      return [];
    }

    // Beats are the same
    if(fromClick.beat === toClick.beat) {
      return [];
    }

    const fromBeat = Math.max(0, Math.ceil(fromClick.beat));
    const toBeat = Math.floor(toClick.beat);

    // Beat hasn't advanced a whole number yet
    if(fromBeat > toBeat) {
      return [];
    }

    const clickEvents: Array<ClickEvent> = [];

    for (let i = fromBeat; i <= toBeat; i++) {
      const time = i / this.tempoBPS;
      clickEvents.push({
        time: time,
        beat: i,
        bar: Math.floor(i / this.beats),
        beatBar: ((i / this.beats) % 1) * this.beats,
        timeDifference: toClick.time - time,
        beatDifference: toClick.beat - i,
      });
    }

    return clickEvents;

  }
}