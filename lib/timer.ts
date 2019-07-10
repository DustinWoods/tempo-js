export interface ITimer {
  onUpdate: (cb: (time: number) => void) => void;
}

export function isTimer(obj: any): obj is ITimer {
  return typeof obj === "object" && typeof obj.onUpdate === "function";
}