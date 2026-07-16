import { BrowserRouter, Route, Routes } from "react-router-dom"

import { fallbackWebRoute, webRoutes } from "@/app/config/routes.config.ts"
import { MarketingLayout } from "@/shell/MarketingLayout"

export function WebRouter() {
  const FallbackPage = fallbackWebRoute.component

  return (
    <BrowserRouter>
      <MarketingLayout>
        <Routes>
          {webRoutes.map((route) => {
            const Page = route.component

            return (
              <Route key={route.path} path={route.path} element={<Page />} />
            )
          })}
          <Route path="*" element={<FallbackPage />} />
        </Routes>
      </MarketingLayout>
    </BrowserRouter>
  )
}
