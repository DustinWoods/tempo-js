export interface TimeSignature {
  beats: number,
  value: number
}

export const commonTime: TimeSignature = {
  beats: 4,
  value: 4
}

export const fourFour = commonTime;

export const cutTime: TimeSignature = {
  beats: 2,
  value: 2
}

export const twoTwo = cutTime;

export const twoFour: TimeSignature = {
  beats: 2,
  value: 4
}

export const threeFour: TimeSignature = {
  beats: 3,
  value: 4
}