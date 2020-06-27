import { CueEvent } from "./cue-event";
import { ClickEvent } from "./click-event";

export type EventTypeMap<C> = {
  cue: CueEvent<C>;
  beat: ClickEvent;
  firstCue: CueEvent<C>;
  lastCue: CueEvent<C>;
}