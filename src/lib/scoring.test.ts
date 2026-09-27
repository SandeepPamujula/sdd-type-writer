import {
  calculateAccuracy,
  calculateScore,
  calculateSpeed,
  roundAccuracyForDisplay,
  roundWpmForDisplay,
} from "./scoring";

describe("scoring: Speed metrics", () => {
  it("Typical session", () => {
    const result = calculateSpeed({
      charactersTyped: 500,
      uncorrectedErrors: 4,
      minutes: 2,
    });

    expect(result.grossWpm).toBe(50);
    expect(result.netWpm).toBe(48);
  });

  it("Net WPM never negative", () => {
    const result = calculateSpeed({
      charactersTyped: 10,
      uncorrectedErrors: 10,
      minutes: 2,
    });

    expect(result.netWpm).toBe(0);
  });
});

describe("scoring: Accuracy", () => {
  it("Corrected mistake still counts", () => {
    const accuracy = calculateAccuracy({
      correctKeystrokes: 100,
      totalKeystrokes: 101,
    });

    expect(Math.floor(accuracy * 100)).toBe(99);
  });

  it("No typing at all", () => {
    const accuracy = calculateAccuracy({
      correctKeystrokes: 0,
      totalKeystrokes: 0,
    });

    expect(accuracy).toBe(0);
  });
});

describe("scoring: Score", () => {
  it("Score calculation", () => {
    expect(calculateScore(50, 0.96)).toBe(48);
  });

  it("Verified example", () => {
    const { grossWpm, netWpm } = calculateSpeed({
      charactersTyped: 153,
      uncorrectedErrors: 1,
      minutes: 2,
    });
    const accuracy = calculateAccuracy({
      correctKeystrokes: 152,
      totalKeystrokes: 153,
    });

    expect(grossWpm).toBe(15.3);
    expect(netWpm).toBeCloseTo(14.8);
    expect(Math.floor(accuracy * 100)).toBe(99);
    expect(calculateScore(netWpm, accuracy)).toBe(15);
  });
});

describe("scoring: Displayed values", () => {
  it("WPM rounding", () => {
    expect(roundWpmForDisplay(47.5)).toBe(48);
  });

  it("Near-perfect accuracy", () => {
    expect(roundAccuracyForDisplay(0.996)).toBe(99);
  });

  it("rounding for display does not affect the score calculation", () => {
    const netWpm = 14.8;
    const accuracy = 152 / 153;
    const scoreBeforeDisplayRounding = calculateScore(netWpm, accuracy);

    roundWpmForDisplay(netWpm);
    roundAccuracyForDisplay(accuracy);

    expect(calculateScore(netWpm, accuracy)).toBe(scoreBeforeDisplayRounding);
    expect(scoreBeforeDisplayRounding).toBe(15);
  });
});
