import { ScrollTrigger } from "@workforce-erp/ui/motion/config"
import {
  animateIn,
  type AnimateInOptions,
  type MotionPresetName,
} from "@workforce-erp/ui/motion/presets"
import { prefersReducedMotion } from "@workforce-erp/ui/motion/preferences"

export interface ScrollRevealOptions extends AnimateInOptions {
  once?: boolean
  preset?: MotionPresetName
  start?: string
  trigger?: Element | string
}

export function revealOnScroll(
  target: Element | string,
  {
    once = true,
    preset = "fade-up",
    start = "top 85%",
    trigger,
    ...animationOptions
  }: ScrollRevealOptions = {}
) {
  if (prefersReducedMotion()) {
    return animateIn(target, preset, animationOptions)
  }

  const tween = animateIn(target, preset, animationOptions)

  ScrollTrigger.create({
    animation: tween,
    once,
    start,
    trigger: trigger ?? target,
  })

  return tween
}
