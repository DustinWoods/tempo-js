import { ITimer } from "./definitions/timer";

type timerUpdateCallback = (time: number) => void;

export class UniversalTimer implements ITimer {
  private callbacks: Array<timerUpdateCallback> = [];
  private position: number = 0;

  constructor(public getTimeFn: () => number) {
    requestAnimationFrame(this.updateTime.bind(this));
  }

  updateTime() {

    // @TODO - try/finally
    const position = this.getTimeFn();

    if(position !== this.position) {
      this.position = position;
      for (let i = 0; i < this.callbacks.length; i++) {
        // @TODO - async callback to avoid handling errors
        this.callbacks[i](position);
      }
    }

    // Regardless of success, keep timer going
    requestAnimationFrame(this.updateTime.bind(this));
  }

  onUpdate(cb: timerUpdateCallback): void {
    this.callbacks.push(cb);
  }
}