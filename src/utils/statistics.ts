/**
 * Pure statistical calculation routines for Weather Analytics
 */

export function mean(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null && v !== undefined && !isNaN(v));
  if (valid.length === 0) return null;
  const sum = valid.reduce((acc, val) => acc + val, 0);
  return sum / valid.length;
}

export function median(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null && v !== undefined && !isNaN(v)).sort((a, b) => a - b);
  if (valid.length === 0) return null;
  const mid = Math.floor(valid.length / 2);
  if (valid.length % 2 === 0) {
    return (valid[mid - 1] + valid[mid]) / 2;
  }
  return valid[mid];
}

export function min(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null && v !== undefined && !isNaN(v));
  if (valid.length === 0) return null;
  return Math.min(...valid);
}

export function max(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null && v !== undefined && !isNaN(v));
  if (valid.length === 0) return null;
  return Math.max(...valid);
}

export function standardDeviation(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null && v !== undefined && !isNaN(v));
  if (valid.length <= 1) return 0;
  const avg = mean(valid);
  if (avg === null) return null;
  const squareDiffs = valid.map((v) => Math.pow(v - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / valid.length;
  return Math.sqrt(avgSquareDiff);
}

/**
 * Calculates simple linear regression y = a + b * x
 * Points: Array of { x: number, y: number }
 * Returns { slope: b, intercept: a }
 */
export function linearRegression(points: { x: number; y: number }[]): { slope: number; intercept: number } | null {
  const valid = points.filter((p) => p.y !== null && p.y !== undefined && !isNaN(p.y));
  const n = valid.length;
  if (n < 2) return null;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const { x, y } = valid[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Calculates moving average with window size
 */
export function movingAverage(values: (number | null)[], windowSize: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < windowSize - 1) {
      result.push(null);
      continue;
    }
    const window = values.slice(i - windowSize + 1, i + 1);
    result.push(mean(window));
  }
  return result;
}

export function countAboveThreshold(values: (number | null)[], threshold: number): number {
  return values.filter((v): v is number => v !== null && v !== undefined && v > threshold).length;
}

export function countBelowThreshold(values: (number | null)[], threshold: number): number {
  return values.filter((v): v is number => v !== null && v !== undefined && v < threshold).length;
}

/**
 * Calculates longest consecutive sequence satisfying condition
 */
export function longestSequence(values: (number | null)[], conditionFn: (val: number) => boolean): number {
  let maxSeq = 0;
  let currentSeq = 0;

  for (const v of values) {
    if (v !== null && v !== undefined && conditionFn(v)) {
      currentSeq++;
      if (currentSeq > maxSeq) {
        maxSeq = currentSeq;
      }
    } else {
      currentSeq = 0;
    }
  }

  return maxSeq;
}

/**
 * Converts yearly slope into rate per decade (slope * 10)
 */
export function trendPerDecade(slope: number | null): number | null {
  if (slope === null || slope === undefined || isNaN(slope)) return null;
  return slope * 10;
}
