import { ITimer } from "./definitions/timer";

type timerUpdateCallback = (time: number) => void;

export class BasicTimer implements ITimer {
  private callbacks: Array<timerUpdateCallback> = [];
  private startTimeMarker: number = Date.now();
  private position: number = 0;
  private animationFrameId?: number = undefined;

  constructor(public autostart = false, public length = Infinity, public loop = true) {
    if(autostart) {
      this.start();
    }
  }

  start() {
    this.startTimeMarker = Date.now();
    if(this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame(this.updateTime.bind(this));
  }

  stop() {
    if(this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  updateTime() {
    this.animationFrameId = undefined;
    const now = Date.now();
    const position = (now - this.startTimeMarker) / 1000;

    if(position !== this.position) {
      this.position = position;

      if(this.position > this.length) {
        if(!this.loop) {
          this.position = this.length;
        } else {
          this.position = this.position % this.length;
        }
      }

      try {
        for (let i = 0; i < this.callbacks.length; i++) {
          this.callbacks[i](position);
        }
      } finally {
        // Regardless of success, keep timer going
        requestAnimationFrame(this.updateTime.bind(this));
      }
    }
  }

  onUpdate(cb: timerUpdateCallback): void {
    this.callbacks.push(cb);
  }
}