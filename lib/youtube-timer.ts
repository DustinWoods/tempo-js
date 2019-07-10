import { ITimer } from "./timer";

type timerUpdateCallback = (time: number) => void;

export type YTPlayer = {
  getCurrentTime: () => number;
};

export function isYTPlayer(obj: any): obj is YTPlayer {
  return typeof obj === "object" && typeof obj.getCurrentTime === "function";
}

export class YTTimer implements ITimer {
  private callbacks: Array<timerUpdateCallback> = [];
  private position: number = 0;

  constructor(public player: YTPlayer) {
    requestAnimationFrame(this.updateTime.bind(this));
  }

  updateTime() {
    const position = this.player.getCurrentTime();

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