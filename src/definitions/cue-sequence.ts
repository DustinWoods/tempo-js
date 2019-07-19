export type CueLike<T> = number | [ number, T ];
export type CueSequence<T> = Array<CueLike<T>>;
export type CueSequenceLean = Array<number>;