import { CueSequence, CueSequenceLean } from "./definitions/cue-sequence";

// Processes cues and produces a tuple of two arrays: one that contains just the time indexes, and another that contains the original data, but with holes.
export function separateCueSequence<T>(cues: CueSequence<T>): [ CueSequenceLean, Array<T> ] {
  const leanMap: CueSequenceLean = [];
  const dataMap: Array<T> = [];

  cues.forEach((cue, i) => {
    if(typeof cue === "number") {
      leanMap[i] = cue;
      return;
    }

    leanMap[i] = cue[0];
    dataMap[i] = cue[1];
  });

  return [ leanMap, dataMap ];
}