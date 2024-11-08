import type { VOIRange } from '../types';

export function rescaleVOIRange(
  voiRange: VOIRange,
  scalingParameters: { rescaleSlope?: number; rescaleIntercept?: number }
): VOIRange {
  const slope = scalingParameters.rescaleSlope ?? 1;
  const intercept = scalingParameters.rescaleIntercept ?? 1;

  return {
    lower: voiRange.lower * slope + intercept,
    upper: voiRange.upper * slope + intercept,
  };
}
