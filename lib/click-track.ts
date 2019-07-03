import { BehaviorSubject, Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { DelegatedEventTarget } from "./delegated-event-target";

function calculateBeat(time: number, tempo: number): number {
  return time * (tempo / 60);
}

function calculateMeasure(time: number, bpm: number, beats: number): number {
  const beat = calculateBeat(time, bpm);
  return beat / beats
}

function calculateMeasureBeat(time: number, bpm: number, beats: number): number {
  const beat = calculateBeat(time, bpm);
  return beat % beats
}

type ClickTrackOptions = {
  tempo: number;
  beats?: number;
  length?: number;
  loop?: boolean;
}

export class ClickTrack extends DelegatedEventTarget {
  currentTime: number = 0; // in seconds
  playing: boolean = false;
  time: BehaviorSubject<number>;
  beat: Observable<number>;
  measure: Observable<number>;
  measureBeat: Observable<number>;
  tempo: number = 0;
  beats: number = 4;
  length: number = Infinity;
  loop: boolean = true;

  constructor(options: ClickTrackOptions) {
    super();

    Object.assign(<ClickTrack>this, options);

    if(this.tempo === 0 || this.tempo < 0) {
      throw new Error(`Invalid tempo (${this.tempo}), must be greater than 0.`);
    }

    this.time = new BehaviorSubject(0);

    this.beat = this.time.pipe(
      map<number, number>((value: number) => {
        return calculateBeat(value, this.tempo);
      })
    );

    this.measure = this.time.pipe(
      map<number, number>((value: number) => {
        return calculateMeasure(value, this.tempo, this.beats);
      })
    );

    this.measureBeat = this.time.pipe(
      map<number, number>((value: number) => {
        return calculateMeasureBeat(value, this.tempo, this.beats);
      })
    );

    this.beat.subscribe((beatNumber) => {
      this.dispatchEvent(new Event('beat'));
    });

  }

  setTime(time: number): void {
    this.currentTime = time;

    if(this.currentTime > this.length) {
      if(!this.loop) {
        this.currentTime = this.length;
        this.playing = false;
      } else {
        this.currentTime = this.currentTime % this.length;
      }
    }

    this.time.next(this.currentTime);
  }

  tick(delta: number): void {
    if(!this.playing) {
      return;
    }

    this.setTime(this.currentTime + delta / 60);
  };
}