import { ArrowLeft, ArrowRight } from "lucide-react"
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useRef,
  useState,
} from "react"

import { Container } from "@/shell/container"
import { cn } from "@workforce-erp/ui/lib/utils"
import {
  bindScrollAnimation,
  gsap,
  motionDistance,
  motionDuration,
  motionEase,
  prefersReducedMotion,
  useGSAP,
} from "@workforce-erp/ui/motion"

export interface TestimonialsSectionProps {
  className?: string
}

const testimonials = [
  {
    id: "amina-rahman",
    image: "/images/testimonials/amina-rahman.jpg",
    imageAlt: "Amina Rahman seated in a bright office",
    name: "Amina Rahman",
    role: "VP, People Operations",
    company: "Harborline Group",
    quote:
      "We finally stopped chasing updates across five different tools. Workforce ERP gave every team one dependable place to work from—and gave me my Fridays back.",
  },
  {
    id: "marcus-lewis",
    image: "/images/testimonials/marcus-lewis.jpg",
    imageAlt: "Marcus Lewis seated at a worktable in a daylight office",
    name: "Marcus Lewis",
    role: "Chief Operating Officer",
    company: "Northbound Studio",
    quote:
      "The biggest shift wasn’t speed—it was confidence. Managers can answer their own questions, and my team gets to focus on the work that actually needs us.",
  },
  {
    id: "sofia-alvarez",
    image: "/images/testimonials/sofia-alvarez.jpg",
    imageAlt: "Sofia Alvarez seated at a table in a modern office",
    name: "Sofia Alvarez",
    role: "Finance Director",
    company: "Everfield Foods",
    quote:
      "When time, payroll, and approvals finally started telling the same story, month-end became calm. We can spot an issue before it reaches the finance desk.",
  },
] as const

const slideCount = testimonials.length

function getNextIndex(currentIndex: number, offset: number) {
  return (currentIndex + offset + slideCount) % slideCount
}

export function TestimonialsSection({ className }: TestimonialsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const slideDirectionRef = useRef(1)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeTestimonial = testimonials[activeIndex]
  const previewIndexes = [
    getNextIndex(activeIndex, 1),
    getNextIndex(activeIndex, 2),
  ]

  useGSAP(
    () => {
      const animatedElements = [
        "[data-testimonial-heading]",
        "[data-testimonial-intro]",
        "[data-testimonial-shell]",
      ]

      if (prefersReducedMotion()) {
        gsap.set(animatedElements, { clearProps: "all" })
        return
      }

      const timeline = gsap.timeline({
        defaults: { ease: motionEase.enter },
        paused: true,
      })

      timeline
        .from("[data-testimonial-heading]", {
          autoAlpha: 0,
          duration: motionDuration.slow,
          y: motionDistance.medium,
        })
        .from(
          "[data-testimonial-intro]",
          {
            autoAlpha: 0,
            duration: motionDuration.normal,
            y: motionDistance.small,
          },
          "-=0.45"
        )
        .from(
          "[data-testimonial-shell]",
          {
            autoAlpha: 0,
            duration: motionDuration.slow,
            y: motionDistance.large,
          },
          "-=0.25"
        )

      if (sectionRef.current) {
        bindScrollAnimation(timeline, {
          once: false,
          start: "top 78%",
          trigger: sectionRef.current,
        })
      }
    },
    { scope: sectionRef }
  )

  useGSAP(
    () => {
      const animatedElements = [
        "[data-testimonial-image-frame]",
        "[data-testimonial-image]",
        "[data-testimonial-copy] > *",
      ]

      if (prefersReducedMotion()) {
        gsap.set(animatedElements, { clearProps: "all" })
        return
      }

      const direction = slideDirectionRef.current
      const timeline = gsap.timeline({
        defaults: { ease: motionEase.enter },
      })

      timeline
        .fromTo(
          "[data-testimonial-image-frame]",
          {
            autoAlpha: 0,
            xPercent: direction * 4,
          },
          {
            autoAlpha: 1,
            duration: motionDuration.slow,
            xPercent: 0,
          }
        )
        .fromTo(
          "[data-testimonial-image]",
          { scale: 1.055 },
          {
            duration: 0.9,
            ease: motionEase.standard,
            scale: 1,
          },
          0
        )
        .fromTo(
          "[data-testimonial-copy] > *",
          {
            autoAlpha: 0,
            y: motionDistance.medium,
          },
          {
            autoAlpha: 1,
            duration: motionDuration.normal,
            stagger: 0.08,
            y: 0,
          },
          0.12
        )
    },
    {
      dependencies: [activeIndex],
      revertOnUpdate: true,
      scope: carouselRef,
    }
  )

  const showPrevious = useCallback(() => {
    slideDirectionRef.current = -1
    setActiveIndex((currentIndex) => getNextIndex(currentIndex, -1))
  }, [])

  const showNext = useCallback(() => {
    slideDirectionRef.current = 1
    setActiveIndex((currentIndex) => getNextIndex(currentIndex, 1))
  }, [])

  const showTestimonial = (index: number) => {
    slideDirectionRef.current = index === getNextIndex(activeIndex, -1) ? -1 : 1
    setActiveIndex(index)
    requestAnimationFrame(() => carouselRef.current?.focus())
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      showPrevious()
    }

    if (event.key === "ArrowRight") {
      event.preventDefault()
      showNext()
    }
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="testimonials-heading"
      className={cn("overflow-hidden py-16 sm:py-20 lg:py-24", className)}
    >
      <Container>
        <header className="mb-8 max-w-3xl sm:mb-10 lg:mb-12">
          <h2
            data-testimonial-heading
            id="testimonials-heading"
            className="font-heading text-[clamp(2.5rem,3.7vw,4rem)] leading-[1.02] font-bold tracking-[-0.055em] text-balance"
          >
            The people behind better workdays.
          </h2>
          <p
            data-testimonial-intro
            className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9"
          >
            See how growing teams bring people, time, payroll, and performance
            into one clear view.
          </p>
        </header>

        <div
          ref={carouselRef}
          aria-label="Customer stories"
          aria-roledescription="carousel"
          className="group/testimonials focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-primary"
          onKeyDown={handleKeyDown}
          role="region"
          tabIndex={0}
          data-testimonial-shell
        >
          <article
            aria-label={`${activeIndex + 1} of ${slideCount}`}
            aria-roledescription="slide"
            className="grid overflow-hidden rounded bg-primary shadow-[0_28px_70px_-42px_oklch(0.145_0_0_/_0.4)] lg:min-h-[30rem] lg:grid-cols-[1.08fr_0.92fr] xl:min-h-[32rem]"
          >
            <div
              key={activeTestimonial.id}
              data-testimonial-image-frame
              className="relative min-h-[17rem] overflow-hidden sm:min-h-[21rem] lg:min-h-full"
            >
              <img
                data-testimonial-image
                alt={activeTestimonial.imageAlt}
                className="absolute inset-0 size-full object-cover"
                decoding="async"
                height="1086"
                loading="lazy"
                src={activeTestimonial.image}
                width="1448"
              />
            </div>

            <div className="flex min-h-[28rem] flex-col bg-primary p-6 text-primary-foreground sm:p-8 lg:min-h-full lg:p-10 xl:p-12">
              <div
                key={activeTestimonial.id}
                aria-live="polite"
                data-testimonial-copy
              >
                <blockquote className="font-heading text-[clamp(1.55rem,2vw,2.1rem)] leading-[1.28] font-medium tracking-[-0.03em] text-balance">
                  “{activeTestimonial.quote}”
                </blockquote>
                <div className="mt-6">
                  <p className="font-heading text-xl font-bold">
                    {activeTestimonial.name}
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-primary-foreground/80 sm:text-base">
                    {activeTestimonial.role}
                    <span aria-hidden="true"> · </span>
                    {activeTestimonial.company}
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-7">
                <div className="flex items-center justify-between gap-6">
                  <button
                    aria-label="Show previous testimonial"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-primary-foreground/70 text-primary-foreground transition-colors hover:bg-primary-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-foreground"
                    onClick={showPrevious}
                    type="button"
                  >
                    <ArrowLeft aria-hidden="true" className="size-5" />
                  </button>

                  <p className="font-heading text-base font-bold tabular-nums">
                    {String(activeIndex + 1).padStart(2, "0")}
                    <span className="px-1.5 text-primary-foreground/60">/</span>
                    {String(slideCount).padStart(2, "0")}
                  </p>

                  <button
                    aria-label="Show next testimonial"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-primary-foreground/70 text-primary-foreground transition-colors hover:bg-primary-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-foreground"
                    onClick={showNext}
                    type="button"
                  >
                    <ArrowRight aria-hidden="true" className="size-5" />
                  </button>
                </div>

                <div
                  aria-hidden="true"
                  className="mt-5 grid grid-cols-3 gap-1.5"
                >
                  {testimonials.map((testimonial, index) => (
                    <span
                      key={testimonial.id}
                      className={cn(
                        "h-1 rounded-full transition-colors",
                        index === activeIndex
                          ? "bg-primary-foreground"
                          : "bg-primary-foreground/35"
                      )}
                    />
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {previewIndexes.map((index) => {
                    const testimonial = testimonials[index]

                    return (
                      <button
                        key={testimonial.id}
                        aria-label={`Show ${testimonial.name}'s testimonial`}
                        className="group/preview relative aspect-[16/9] overflow-hidden rounded border border-primary-foreground/40 bg-primary-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-foreground"
                        onClick={() => showTestimonial(index)}
                        type="button"
                      >
                        <img
                          alt=""
                          aria-hidden="true"
                          className="size-full object-cover transition duration-300 group-hover/preview:scale-[1.03] group-hover/preview:opacity-90"
                          decoding="async"
                          height="1086"
                          loading="lazy"
                          src={testimonial.image}
                          width="1448"
                        />
                        <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/65 to-transparent px-3 pt-8 pb-2 text-left text-xs font-semibold text-white">
                          {testimonial.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </article>

          <p className="sr-only">
            Use the previous and next buttons, image previews, or the left and
            right arrow keys to browse testimonials.
          </p>
        </div>
      </Container>
    </section>
  )
}
