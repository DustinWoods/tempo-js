import { CueSequence } from "./cue-sequence";
import { ITimer } from "./timer";

export type BaseClickTrackOptions<C> = {
  tempo?: number;
  cues?: CueSequence<C>;
  offset?: number;
  beats?: number;
}

export type ClickTrackOptionVariants = {
  timerSource: undefined,
  autostart?: boolean,
  length?: number;
  loop?: boolean;
} | {
  timerSource: ITimer,
} | {
  timerSource: () => number,
}