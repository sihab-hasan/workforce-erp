import type { ReactNode } from "react"

type BlankLayoutProps = {
  children: ReactNode
}

export function BlankLayout({ children }: BlankLayoutProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {children}
    </main>
  )
}
