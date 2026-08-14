export const environment = {
  appName: "Workforce ERP Portal",
  appVersion: "0.0.1",
  mode: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  /** Backend API base URL. Set via VITE_API_BASE_URL in .env files. */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
}

