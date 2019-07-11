import { ITimer } from "./definitions/timer";

type timerUpdateCallback = (time: number) => void;

export class MediaTimer implements ITimer {
  private callbacks: Array<timerUpdateCallback> = [];
  private position: number = 0;

  constructor(public mediaElement: HTMLMediaElement) {
    requestAnimationFrame(this.updateTime.bind(this));
  }

  updateTime() {
    const position = this.mediaElement.currentTime;

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