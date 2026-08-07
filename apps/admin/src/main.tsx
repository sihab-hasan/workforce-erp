import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@workforce-erp/ui/globals.css"
import { ThemeProvider } from "@workforce-erp/ui/providers/theme-provider"
import { App } from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)
