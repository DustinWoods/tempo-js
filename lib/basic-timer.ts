import { ITimer } from "./timer";

type timerUpdateCallback = (time: number) => void;

export class BasicTimer implements ITimer {
  private callbacks: Array<timerUpdateCallback> = [];
  private startTimeMarker: number = Date.now();
  private position: number = 0;
  private animationFrameId?: number = undefined;

  constructor(autostart = false) {
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