import { useSyncExternalStore } from "react"

import { getReducedMotionMediaQuery } from "@workforce-erp/ui/motion/preferences"

const query = getReducedMotionMediaQuery()

function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia(query)
  mediaQuery.addEventListener("change", callback)

  return () => mediaQuery.removeEventListener("change", callback)
}

function getSnapshot() {
  return window.matchMedia(query).matches
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
