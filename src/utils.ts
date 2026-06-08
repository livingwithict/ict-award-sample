/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Computes the logarithmic compressed and normalized final score.
 * Formula: Final Score = ( LN(Raw Score + 1) / LN(101) ) * 100
 * Ensures raw score of 0 gives 0, raw score of 100 gives 100, and smooths out variance.
 */
export function computeLogarithmicScore(rawScore: number): number {
  if (rawScore <= 0) return 0;
  if (rawScore >= 100) return 100;
  const score = (Math.log(rawScore + 1) / Math.log(101)) * 100;
  return Math.round(score * 10) / 10; // Round to 1 decimal place
}

/**
 * Local storage utility with fallback
 */
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn("Storage read failed", e);
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Storage write failed", e);
    }
  }
};
