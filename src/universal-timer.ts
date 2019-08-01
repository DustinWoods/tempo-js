import { ITimer } from "./definitions/timer";
import { IEventHandler, EventDispatcher } from "ste-events";

export class UniversalTimer implements ITimer {
  private position: number = 0;
  private onTick = new EventDispatcher<ITimer, number>();
  private animationFrameId?: number = undefined;

  constructor(public getTimeFn: () => number) {
    this.animationFrameId = requestAnimationFrame(this.updateTime.bind(this));
  }

  updateTime() {
    this.animationFrameId = undefined;

    const position = this.getTimeFn();

    try {
      if(position !== this.position) {
        this.position = position;
        this.onTick.dispatch(this, position);
      }
    } finally {
      // Regardless of success, keep timer going
      this.animationFrameId = requestAnimationFrame(this.updateTime.bind(this));
    }
  }

  onUpdate(cb: IEventHandler<ITimer, number>): void {
    this.onTick.subscribe(cb);
  }

  offUpdate(cb: IEventHandler<ITimer, number>): void {
    this.onTick.unsubscribe(cb);
  }

  deconstruct(): void {
    this.onTick.clear();
    if(this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}