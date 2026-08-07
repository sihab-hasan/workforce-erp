import { ScrollTrigger } from "@workforce-erp/ui/motion/config"
import {
  animateIn,
  type AnimateInOptions,
  type MotionPresetName,
} from "@workforce-erp/ui/motion/presets"
import { prefersReducedMotion } from "@workforce-erp/ui/motion/preferences"

export interface ScrollRevealOptions extends AnimateInOptions {
  end?: string
  once?: boolean
  preset?: MotionPresetName
  start?: string
  toggleActions?: string
  trigger?: Element | string
}

export interface ScrollAnimationOptions {
  end?: string
  once?: boolean
  start?: string
  toggleActions?: string
  trigger: Element | string
}

export function bindScrollAnimation(
  animation: gsap.core.Animation,
  {
    end,
    once = false,
    start = "top 85%",
    toggleActions = "play reverse play reverse",
    trigger,
  }: ScrollAnimationOptions
) {
  if (prefersReducedMotion()) {
    animation.progress(1).pause()
    return null
  }

  return ScrollTrigger.create({
    animation,
    end,
    once,
    start,
    toggleActions: once ? "play none none none" : toggleActions,
    trigger,
  })
}

export function revealOnScroll(
  target: Element | string,
  {
    end,
    once = false,
    preset = "fade-up",
    start = "top 85%",
    toggleActions = "play reverse play reverse",
    trigger,
    ...animationOptions
  }: ScrollRevealOptions = {}
) {
  if (prefersReducedMotion()) {
    return animateIn(target, preset, animationOptions)
  }

  const tween = animateIn(target, preset, {
    ...animationOptions,
    paused: true,
  })

  bindScrollAnimation(tween, {
    end,
    once,
    start,
    toggleActions,
    trigger: trigger ?? target,
  })

  return tween
}
