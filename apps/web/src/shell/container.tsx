import { cn } from "@workforce-erp/ui/lib/utils"

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12",
        className
      )}
    >
      {children}
    </div>
  )
}
