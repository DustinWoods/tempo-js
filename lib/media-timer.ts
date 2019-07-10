import { ITimer } from "./timer";

type timerUpdateCallback = (time: number) => void;

export class MediaTimer implements ITimer {
  private callbacks: Array<timerUpdateCallback> = [];
  private position: number = 0;

  constructor(public mediaElement: HTMLMediaElement) {
    requestAnimationFrame(this.updateTime.bind(this));
  }

  updateTime() {
    const position = this.mediaElement.currentTime;

    try {
      if(position !== this.position) {
        this.position = position;
        for (let i = 0; i < this.callbacks.length; i++) {
          this.callbacks[i](position);
        }
      }
    } finally {
      // Regardless of success, keep timer going
      requestAnimationFrame(this.updateTime.bind(this));
    }
  }

  onUpdate(cb: timerUpdateCallback): void {
    this.callbacks.push(cb);
  }
}