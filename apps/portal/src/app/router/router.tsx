import type { ReactNode } from "react"
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useSearchParams,
} from "react-router-dom"
import { useAuth } from "@workforce-erp/auth-client"

import {
  authRoutes,
  fallbackPortalRoute,
  portalRoutes,
} from "@/app/config/routes.config.ts"
import { PermissionRoute } from "@/app/router/permission-route.tsx"
import { ProtectedRoute } from "@/app/router/protected-route.tsx"
import { safeReturnTo } from "@/modules/core/authentication/navigation.ts"
import { PortalLayout } from "@/shell/PortalLayout.tsx"

function AnonymousOnly({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [searchParams] = useSearchParams()

  if (session) {
    return <Navigate to={safeReturnTo(searchParams.get("returnTo"))} replace />
  }

  return <>{children}</>
}

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
                <ProtectedRoute>
                  <PermissionRoute allowedRoles={route.allowedRoles}>
                    <PortalLayout>
                      <Page />
                    </PortalLayout>
                  </PermissionRoute>
                </ProtectedRoute>
              }
            />
          )
        })}
        {authRoutes.map((route) => {
          const Page = route.component

          return (
            <Route
              key={route.key}
              path={route.path}
              element={
                route.anonymousOnly === false ? (
                  <Page />
                ) : (
                  <AnonymousOnly>
                    <Page />
                  </AnonymousOnly>
                )
              }
            />
          )
        })}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <PortalLayout>
                <FallbackPage />
              </PortalLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
