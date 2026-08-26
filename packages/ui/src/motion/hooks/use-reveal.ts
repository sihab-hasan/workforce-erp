import { useRef } from "react";

import { useGSAP } from "@workforce-erp/ui/motion/config";
import { useReducedMotion } from "@workforce-erp/ui/motion/hooks/use-reduced-motion";
import { type MotionPresetName } from "@workforce-erp/ui/motion/presets";
import { revealOnScroll, type ScrollRevealOptions } from "@workforce-erp/ui/motion/scroll";

export function useReveal<TElement extends HTMLElement = HTMLDivElement>(
  preset: MotionPresetName = "fade-up",
  options: Omit<ScrollRevealOptions, "preset" | "trigger"> = {},
) {
  const ref = useRef<TElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (ref.current) {
        revealOnScroll(ref.current, {
          ...options,
          preset,
          trigger: ref.current,
        });
      }
    },
    {
      dependencies: [
        options.delay,
        options.duration,
        options.end,
        options.ease,
        options.once,
        options.stagger,
        options.start,
        options.toggleActions,
        preset,
        reducedMotion,
      ],
      revertOnUpdate: true,
      scope: ref,
    },
  );

  return ref;
}
