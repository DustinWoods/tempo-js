import { TimeSignature } from "./time-signature";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from 'rxjs/operators';

function calculateBeat(time: number, bpm: number): number {
  return time * (bpm / 60);
}

function calculateMeasure(time: number, bpm: number, signature: TimeSignature): number {
  const beat = calculateBeat(time, bpm);
  return beat / signature.beats
}

function calculateMeasureBeat(time: number, bpm: number, signature: TimeSignature): number {
  const beat = calculateBeat(time, bpm);
  return beat % signature.beats
}

export default class Tempo {
  private currentTime: number; // in seconds
  playing: boolean;
  time: BehaviorSubject<number>;
  beat: Observable<number>;
  measure: Observable<number>;
  measureBeat: Observable<number>;

  constructor(public bpm: number, public signature: TimeSignature, public length: number = Infinity, public loop: boolean = false) {

    this.currentTime = 0;
    this.playing = true;
    this.time = new BehaviorSubject(0);

    this.beat = this.time.pipe(
      map<number, number>((value: number) => {
        return calculateBeat(value, this.bpm);
      })
    );

    this.measure = this.time.pipe(
      map<number, number>((value: number) => {
        return calculateMeasure(value, this.bpm, this.signature);
      })
    );

    this.measureBeat = this.time.pipe(
      map<number, number>((value: number) => {
        return calculateMeasureBeat(value, this.bpm, this.signature);
      })
    );

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