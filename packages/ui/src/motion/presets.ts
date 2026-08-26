import { gsap } from "@workforce-erp/ui/motion/config";
import { prefersReducedMotion } from "@workforce-erp/ui/motion/preferences";
import {
  motionDistance,
  motionDuration,
  motionEase,
  motionStagger,
} from "@workforce-erp/ui/motion/tokens";

export type MotionTarget = Parameters<typeof gsap.to>[0];
export type MotionPresetName = "fade" | "fade-down" | "fade-up" | "scale";

interface MotionPreset {
  from: gsap.TweenVars;
  to: gsap.TweenVars;
}

export interface AnimateInOptions {
  delay?: number;
  duration?: number;
  ease?: string;
  paused?: boolean;
  stagger?: number;
}

const presets: Record<MotionPresetName, MotionPreset> = {
  fade: {
    from: { autoAlpha: 0 },
    to: { autoAlpha: 1 },
  },
  "fade-down": {
    from: { autoAlpha: 0, y: -motionDistance.medium },
    to: { autoAlpha: 1, y: 0 },
  },
  "fade-up": {
    from: { autoAlpha: 0, y: motionDistance.medium },
    to: { autoAlpha: 1, y: 0 },
  },
  scale: {
    from: { autoAlpha: 0, scale: 0.96 },
    to: { autoAlpha: 1, scale: 1 },
  },
};

export function animateIn(
  target: MotionTarget,
  presetName: MotionPresetName = "fade-up",
  options: AnimateInOptions = {},
) {
  const preset = presets[presetName];

  if (prefersReducedMotion()) {
    return gsap.set(target, {
      autoAlpha: 1,
      clearProps: "transform",
    });
  }

  return gsap.fromTo(target, preset.from, {
    ...preset.to,
    delay: options.delay ?? 0,
    duration: options.duration ?? motionDuration.slow,
    ease: options.ease ?? motionEase.enter,
    ...(options.paused !== undefined ? { paused: options.paused } : {}),
    ...(options.stagger !== undefined ? { stagger: options.stagger } : {}),
  });
}

export function animateOut(
  target: MotionTarget,
  options: Pick<AnimateInOptions, "delay" | "duration" | "ease"> = {},
) {
  return gsap.to(target, {
    autoAlpha: 0,
    delay: options.delay ?? 0,
    duration: prefersReducedMotion()
      ? motionDuration.instant
      : (options.duration ?? motionDuration.normal),
    ease: options.ease ?? motionEase.exit,
  });
}

export function staggerIn(
  target: MotionTarget,
  presetName: MotionPresetName = "fade-up",
  options: AnimateInOptions = {},
) {
  return animateIn(target, presetName, {
    ...options,
    stagger: options.stagger ?? motionStagger.normal,
  });
}
