import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { RequireAuth } from "@workforce-erp/auth-client"

import {
  authRoutes,
  fallbackPortalRoute,
  portalRoutes,
} from "@/app/config/routes.config.ts"
import { PortalLayout } from "@/shell/PortalLayout.tsx"

export function PortalRouter() {
  const FallbackPage = fallbackPortalRoute.component

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {portalRoutes.map((route) => {
          const Page = route.component

          return (
            <Route
              key={route.key}
              path={route.path}
              element={
                <RequireAuth fallback={<Navigate to="/auth/login" replace />}>
                  <PortalLayout>
                    <Page />
                  </PortalLayout>
                </RequireAuth>
              }
            />
          )
        })}
        {authRoutes.map((route) => {
          const Page = route.component

          return <Route key={route.key} path={route.path} element={<Page />} />
        })}
        <Route path="*" element={<FallbackPage />} />
      </Routes>
    </BrowserRouter>
  )
}
