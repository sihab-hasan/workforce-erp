import { ArrowUp } from "lucide-react"
import { useEffect, useState } from "react"

import { cn } from "@workforce-erp/ui/lib/utils"

const VISIBILITY_THRESHOLD = 480

export function ScrollToTopControl() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > VISIBILITY_THRESHOLD)
    }

    updateVisibility()
    window.addEventListener("scroll", updateVisibility, { passive: true })

    return () => {
      window.removeEventListener("scroll", updateVisibility)
    }
  }, [])

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    window.scrollTo({
      behavior: reduceMotion ? "instant" : "smooth",
      left: 0,
      top: 0,
    })
  }

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      onClick={scrollToTop}
      className={cn(
        "group fixed right-4 bottom-4 z-40 flex size-12 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-[opacity,transform,visibility] duration-300 ease-out hover:-translate-y-1 hover:shadow-xl focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none sm:right-6 sm:bottom-6",
        isVisible
          ? "visible translate-y-0 opacity-100"
          : "invisible translate-y-5 opacity-0"
      )}
    >
      <ArrowUp
        aria-hidden="true"
        className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5"
      />
    </button>
  )
}
