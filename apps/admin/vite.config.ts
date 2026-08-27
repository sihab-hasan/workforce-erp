import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const repoEnvDir = "../../";

function numberEnv(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 65535 ? parsed : fallback;
}

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, repoEnvDir, "");
  const read = (name: string) => fileEnv[name];
  const proxyTarget = read("VITE_API_PROXY_TARGET") || "http://127.0.0.1:8000";
  const proxy = {
    "/api": { target: proxyTarget, changeOrigin: true },
    "/sanctum": { target: proxyTarget, changeOrigin: true },
  };

  return {
    envDir: repoEnvDir,
    plugins: [react(), tailwindcss()],
    server: {
      host: read("DEV_HOST") || "localhost",
      port: numberEnv(read("ADMIN_DEV_PORT"), 5175),
      strictPort: true,
      proxy,
    },
    preview: {
      host: read("DEV_HOST") || "localhost",
      port: numberEnv(read("ADMIN_PREVIEW_PORT"), 4175),
      strictPort: true,
      proxy,
    },
  };
});
