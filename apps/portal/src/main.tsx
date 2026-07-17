import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@workforce-erp/ui/globals.css"
import { App } from "@/app/App.tsx"
import { ThemeProvider } from "@/app/providers/ThemeProvider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)
