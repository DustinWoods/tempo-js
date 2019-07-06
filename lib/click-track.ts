import { EventList, IEventHandler } from 'ste-events';
import { Click } from './definitions/click';
import { ClickEvent } from './definitions/click-event';

type ClickTrackOptions = {
  tempo: number;
  beats?: number;
  length?: number;
  loop?: boolean;
}

type ClickTrackEventName = "beat";// | "bar" | "track" | "start" | "stop";

export class ClickTrack {
  playing: boolean = false;
  tempo: number = 0;
  beats: number = 4;
  length: number = Infinity;
  loop: boolean = true;
  private currentClick: Click;
  private previousClick: Click;
  private tempoBPS: number = 0;
  private events = new EventList<ClickTrack, ClickEvent>();

  constructor(options: ClickTrackOptions) {

    Object.assign(<ClickTrack>this, options);

    // @TODO - update this if this.tempo changes
    this.tempoBPS = this.tempo / 60;

    if(this.tempo === 0 || this.tempo < 0) {
      throw new Error(`Invalid tempo (${this.tempo}), must be greater than 0.`);
    }

    this.currentClick = {
      beat: 0,
      bar: 0,
      time: 0,
      beatBar: 0,
    };

    this.previousClick = this.currentClick;

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

    // Handling end of track. Maybe loop to the beginning
    if(time > this.length) {
      if(!this.loop) {
        time = this.length;
        this.playing = false;
      } else {
        time = time % this.length;
      }
    }

    // Set previous click pointer to current click before we change current click
    this.previousClick = this.currentClick;

    // Calculate current click
    const beat = time * this.tempoBPS;
    const bar = beat / this.beats;
    const beatBar = beat % this.beats;
    this.currentClick = {
      time,
      beat,
      bar,
      beatBar,
    };

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
      throw new Error('Implement calculating clicks for looped track');
    }

    // Beats are the same
    if(fromClick.beat === toClick.beat) {
      return [];
    }

    const fromBeat = Math.ceil(fromClick.beat);
    const toBeat = Math.floor(toClick.beat);

    // Beat hasn't advanced an whole number yet
    if(fromBeat > toBeat) {
      return [];
    }

    const clickEvents: Array<ClickEvent> = [];

    for (var i = fromBeat; i <= toBeat; i++) {
      const time = i / this.tempoBPS;
      clickEvents.push({
        time,
        beat: i,
        bar: Math.floor(i / this.beats),
        beatBar: ((i / this.beats) % 1) * this.beats,
        timeDifference: toClick.time - time,
        beatDifference: toClick.beat - i,
      });
    }

    return clickEvents;

  }

  // Advance time by delta seconds
  tick(delta: number): void {
    if(!this.playing) {
      return;
    }

    this.setTime(this.currentClick.time + delta);
  }
}