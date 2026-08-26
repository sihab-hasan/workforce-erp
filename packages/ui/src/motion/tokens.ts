export const motionDuration = {
  instant: 0.01,
  fast: 0.2,
  normal: 0.4,
  slow: 0.7,
} as const;

export const motionEase = {
  enter: "power3.out",
  exit: "power2.in",
  standard: "power2.inOut",
} as const;

export const motionDistance = {
  small: 12,
  medium: 24,
  large: 48,
} as const;

export const motionStagger = {
  fast: 0.05,
  normal: 0.1,
  slow: 0.16,
} as const;
