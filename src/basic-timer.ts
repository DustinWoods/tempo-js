import { ITimer } from "./definitions/timer";
import { EventDispatcher, IEventHandler } from 'ste-events';

export class BasicTimer implements ITimer {
  private startTimeMarker: number = Date.now();
  private position: number = 0;
  private animationFrameId?: number = undefined;
  private onTick = new EventDispatcher<ITimer, number>();

  constructor(public autostart = false, public length = Infinity, public loop = true) {
    if(autostart) {
      this.start();
    }
  }

  start() {
    this.startTimeMarker = Date.now();
    if(this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = requestAnimationFrame(this.updateTime.bind(this));
  }

  stop() {
    if(this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
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
        this.onTick.dispatch(this, position);
      } finally {
        // Regardless of success, keep timer going
        this.animationFrameId = requestAnimationFrame(this.updateTime.bind(this));
      }
    }
  }

  onUpdate(cb: IEventHandler<ITimer, number>): void {
    this.onTick.subscribe(cb);
  }

  offUpdate(cb: IEventHandler<ITimer, number>): void {
    this.onTick.unsubscribe(cb);
  }

  deconstruct() {
    this.onTick.clear();
    if(this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}