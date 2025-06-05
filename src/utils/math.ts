// utils/math.ts
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const roundToDecimals = (value: number, decimals: number): number => {
  return Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals);
};
