import { env } from "./env";

export const apiConfig = {
  baseUrl: env.apiUrl,
  credentials: "include" as const,
} as const;
