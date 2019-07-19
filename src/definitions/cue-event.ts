import { ClickEvent } from "./click-event";

export interface CueEvent<C> extends ClickEvent {
  cue: number;
  data: C | null;
}