export interface CueEvent<C> {
  time: number;
  cueIndex: number;
  data: C | null;
  timeDifference: number,
}