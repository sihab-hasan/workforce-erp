import * as React from "react";
import { cn } from "@workforce-erp/ui/lib/utils";

export interface LogoIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Visual variant:
   * - 'default': Transparent background, mark styled with currentColor.
   * - 'badge': Rounded container tile with contrasting mark.
   */
  variant?: "default" | "badge";
  className?: string;
}

/**
 * Single dynamic SVG Logo Icon for Workforce ERP.
 *
 * - No hardcoded width/height attributes so it scales fluidly via CSS / Tailwind classes.
 * - Uses `currentColor` for dynamic theming across light, dark, and inverted container surfaces.
 */
export function LogoIcon({ variant = "default", className, ...props }: LogoIconProps) {
  if (variant === "badge") {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={cn("h-8 w-auto aspect-square shrink-0", className)}
        {...props}
      >
        <rect width="64" height="64" rx="16" className="fill-current opacity-15 dark:opacity-25" />
        <rect width="64" height="64" rx="16" className="stroke-current stroke-1 opacity-20" />
        <path
          d="M14 18h8l5 28h-8L14 18Zm14 0h8l5 28h-8l-5-28Zm18 0h8L43 46h-8l11-28Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("h-8 w-auto aspect-square shrink-0", className)}
      {...props}
    >
      <path
        d="M14 18h8l5 28h-8L14 18Zm14 0h8l5 28h-8l-5-28Zm18 0h8L43 46h-8l11-28Z"
        fill="currentColor"
      />
    </svg>
  );
}

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
  variant?: "default" | "badge";
  sublabel?: string;
  iconClassName?: string;
  textClassName?: string;
}

const SIZE_STYLES = {
  sm: {
    icon: "h-6 w-auto",
    title: "text-base tracking-[-0.03em]",
    sublabel: "text-[9px] tracking-[0.16em]",
  },
  md: {
    icon: "h-8 w-auto",
    title: "text-lg tracking-[-0.035em]",
    sublabel: "text-[10px] tracking-[0.18em]",
  },
  lg: {
    icon: "h-10 w-auto",
    title: "text-xl tracking-[-0.04em]",
    sublabel: "text-xs tracking-[0.2em]",
  },
} as const;

/**
 * Full application logo component combining the dynamic SVG icon with brand typography.
 * Adapts to parent color schemes and container themes automatically.
 */
export function Logo({
  size = "md",
  iconOnly = false,
  variant = "default",
  sublabel,
  className,
  iconClassName,
  textClassName,
  ...props
}: LogoProps) {
  const sizeConfig = SIZE_STYLES[size];

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)} {...props}>
      <LogoIcon variant={variant} className={cn(sizeConfig.icon, iconClassName)} />
      {!iconOnly && (
        <span className="flex min-w-0 flex-col leading-none">
          {sublabel && (
            <span
              className={cn(
                "font-bold uppercase text-primary dark:text-emerald-400 mb-0.5",
                sizeConfig.sublabel,
              )}
            >
              {sublabel}
            </span>
          )}
          <span
            className={cn(
              "font-semibold text-foreground tracking-[-0.035em] whitespace-nowrap",
              sizeConfig.title,
              textClassName,
            )}
          >
            Workforce ERP
          </span>
        </span>
      )}
    </div>
  );
}
