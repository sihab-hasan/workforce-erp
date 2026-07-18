# Shared UI motion

This directory is the monorepo's shared JavaScript motion layer.

Use CSS transitions for simple hover, focus, and open/closed states. Use this
motion layer for sequenced entrances, staggered content, timelines, and
scroll-driven animation.

## Rules

- Import motion helpers from `@workforce-erp/ui/motion`.
- Keep animation orchestration out of page components when it becomes a
  business or multi-section workflow.
- Use `useGSAP` or `useReveal` in React so animations are reverted on unmount.
- Respect reduced-motion preferences. The shared helpers do this by default.
- Register any additional GSAP plugin once in `config.ts`.
- Prefer transforms and opacity for smooth rendering.
- Never hide required content when JavaScript is unavailable.

## React reveal

```tsx
import { useReveal } from "@workforce-erp/ui/motion"

export function Example() {
  const ref = useReveal<HTMLElement>("fade-up")

  return <section ref={ref}>Content</section>
}
```

## Scoped timeline

```tsx
import { useRef } from "react"
import { gsap, useGSAP } from "@workforce-erp/ui/motion"

export function Example() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap
        .timeline()
        .from("[data-title]", { autoAlpha: 0, y: 24 })
        .from("[data-action]", { autoAlpha: 0, y: 12 }, "-=0.25")
    },
    { scope }
  )

  return <div ref={scope}>...</div>
}
```

## Scroll reveal

Call `revealOnScroll` inside `useGSAP`. Cleanup is automatic because
`ScrollTrigger` is registered with the GSAP context.

```tsx
useGSAP(
  () => {
    revealOnScroll("[data-reveal]", { start: "top 85%" })
  },
  { scope }
)
```
