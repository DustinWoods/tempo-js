import { CueSequence } from "./cue-sequence";
import { ITimer } from "./timer";
import { YTPlayer } from "../youtube-timer";

export type BaseClickTrackOptions<C> = {
  tempo: number;
  cues?: CueSequence<C>;
  offset?: number;
  beats?: number;
}

export type ClickTrackOptionVariants = {
  timerSource: HTMLMediaElement,
} | {
  timerSource: undefined,
  autostart?: boolean,
  length?: number;
  loop?: boolean;
} | {
  timerSource: ITimer,
} | {
  timerSource: YTPlayer,
}