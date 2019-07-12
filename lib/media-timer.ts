import { UniversalTimer } from "./universal-timer";

export class MediaTimer extends UniversalTimer {
  constructor(public mediaElement: HTMLMediaElement) {
    super(() => mediaElement.currentTime);
  }
}