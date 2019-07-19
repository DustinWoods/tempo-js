import { Click } from "./click";

export interface ClickEvent extends Click {
  timeDifference: number,
  beatDifference: number,
}