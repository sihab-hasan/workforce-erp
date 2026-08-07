import { Outlet, ScrollRestoration } from "react-router-dom"

import { ScrollToTopControl } from "@/shared/components/navigation"
import SiteFooter from "./SiteFooter"
import SiteHeader from "./SiteHeader"

export function MarketingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <ScrollToTopControl />
      <ScrollRestoration />
    </div>
  )
}
