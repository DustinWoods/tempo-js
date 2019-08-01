import { IEventHandler } from "ste-events";

export interface ITimer {
  onUpdate: (cb: IEventHandler<ITimer, number>) => void;
  offUpdate: (cb: IEventHandler<ITimer, number>) => void;
  deconstruct: () => void;
}

export function isTimer(obj: any): obj is ITimer {
  return typeof obj === "object" &&
    typeof obj.onUpdate === "function" &&
    typeof obj.offUpdate === "function" &&
    typeof obj.deconstruct === "function";
}