export interface SpeedInput {
  charactersTyped: number;
  uncorrectedErrors: number;
  minutes: number;
}

export interface SpeedResult {
  grossWpm: number;
  netWpm: number;
}

export function calculateSpeed(input: SpeedInput): SpeedResult {
  const { charactersTyped, uncorrectedErrors, minutes } = input;
  const grossWpm = charactersTyped / 5 / minutes;
  const netWpm = Math.max(0, grossWpm - uncorrectedErrors / minutes);

  return { grossWpm, netWpm };
}

export interface AccuracyInput {
  correctKeystrokes: number;
  totalKeystrokes: number;
}

export function calculateAccuracy(input: AccuracyInput): number {
  const { correctKeystrokes, totalKeystrokes } = input;
  if (totalKeystrokes === 0) {
    return 0;
  }
  return correctKeystrokes / totalKeystrokes;
}

export function calculateScore(netWpm: number, accuracy: number): number {
  return Math.round(netWpm * accuracy);
}

export function roundWpmForDisplay(wpm: number): number {
  return Math.round(wpm);
}

export function roundAccuracyForDisplay(accuracy: number): number {
  return Math.floor(accuracy * 100);
}
