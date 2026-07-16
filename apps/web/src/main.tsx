import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@workforce-erp/ui/globals.css"
import "@/shared/styles/index.css"
import { App } from "@/app/App.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
