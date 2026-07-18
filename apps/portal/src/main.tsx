import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@workforce-erp/ui/globals.css"
import "@/styles/portal-theme.css"
import { ThemeProvider } from "@workforce-erp/ui/providers/theme-provider"
import { App } from "@/app/App.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="portal-theme">
      <App />
    </ThemeProvider>
  </StrictMode>
)
