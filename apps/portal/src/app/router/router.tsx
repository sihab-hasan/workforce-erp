import { useEffect, useState } from "react"
import {
  authRoutes,
  defaultPortalRoute,
  fallbackPortalRoute,
  portalRoutes,
} from "@/app/config/routes.config.ts"
import { PortalLayout } from "@/shell/PortalLayout.tsx"

function normalizePath(hash: string) {
  if (hash.startsWith("#/")) {
    return hash.slice(1)
  }

  if (hash === "#") {
    return "/"
  }

  return hash ? hash.replace(/^#/, "") : "/"
}

function getCurrentPath() {
  return normalizePath(window.location.hash)
}

const allRoutes = [...portalRoutes, ...authRoutes]

export function PortalRouter() {
  const [path, setPath] = useState(getCurrentPath)

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = defaultPortalRoute.path
    }

    const handleHashChange = () => {
      setPath(getCurrentPath())
    }

    window.addEventListener("hashchange", handleHashChange)

    return () => {
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [])

  const route =
    allRoutes.find((candidate) => candidate.path === path) ??
    fallbackPortalRoute

  // Auth routes (login, forgot-password, etc.) render without the portal shell
  if (route.isAuthRoute) {
    const AuthPage = route.component
    return <AuthPage />
  }

  return <PortalLayout route={route} />
}
