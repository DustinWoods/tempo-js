import { UniversalTimer } from "./universal-timer";

export type YTPlayer = {
  getCurrentTime: () => number;
  getDuration: () => number;
};

export function isYTPlayer(obj: any): obj is YTPlayer {
  return typeof obj === "object"
  && typeof obj.getCurrentTime === "function"
  && typeof obj.getDuration === "function";
}

export class YTTimer extends UniversalTimer {
  constructor(public player: YTPlayer) {
    super(() => player.getCurrentTime());
  }
}