import { environment } from "@/app/config/environment.ts"

export const appConfig = {
  name: environment.appName,
  version: environment.appVersion,
  tagline: "Unified operations for people, finance, and growth teams",
  commandHint: "Press / to jump between sections",
}
