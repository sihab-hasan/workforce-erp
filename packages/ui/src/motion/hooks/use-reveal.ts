import { useRef } from "react"

import { useGSAP } from "@workforce-erp/ui/motion/config"
import { useReducedMotion } from "@workforce-erp/ui/motion/hooks/use-reduced-motion"
import {
  animateIn,
  type AnimateInOptions,
  type MotionPresetName,
} from "@workforce-erp/ui/motion/presets"

export function useReveal<TElement extends HTMLElement = HTMLDivElement>(
  preset: MotionPresetName = "fade-up",
  options: AnimateInOptions = {}
) {
  const ref = useRef<TElement>(null)
  const reducedMotion = useReducedMotion()

  useGSAP(
    () => {
      if (ref.current) {
        animateIn(ref.current, preset, options)
      }
    },
    {
      dependencies: [
        options.delay,
        options.duration,
        options.ease,
        options.stagger,
        preset,
        reducedMotion,
      ],
      revertOnUpdate: true,
      scope: ref,
    }
  )

  return ref
}
