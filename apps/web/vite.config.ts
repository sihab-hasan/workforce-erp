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
  const host = read("DEV_HOST") || "localhost";
  const base = process.env.VITE_BASE_PATH || read("WEB_BASE_PATH") || "/";
  const proxyTarget = read("VITE_API_PROXY_TARGET") || "http://127.0.0.1:8000";
  const apiProxy = {
    "/api": { target: proxyTarget, changeOrigin: true },
    "/sanctum": { target: proxyTarget, changeOrigin: true },
    "/broadcasting": { target: proxyTarget, changeOrigin: true },
  };
  const devProxy = {
    ...apiProxy,
    "/erp": {
      target: `http://${host}:${numberEnv(read("ERP_DEV_PORT"), 5174)}`,
      changeOrigin: true,
      ws: true,
    },
    "/admin": {
      target: `http://${host}:${numberEnv(read("ADMIN_DEV_PORT"), 5175)}`,
      changeOrigin: true,
      ws: true,
    },
  };
  const previewProxy = {
    ...apiProxy,
    "/erp": {
      target: `http://${host}:${numberEnv(read("ERP_PREVIEW_PORT"), 4174)}`,
      changeOrigin: true,
    },
    "/admin": {
      target: `http://${host}:${numberEnv(read("ADMIN_PREVIEW_PORT"), 4175)}`,
      changeOrigin: true,
    },
  };

  return {
    base,
    envDir: repoEnvDir,
    plugins: [react(), tailwindcss()],
    server: {
      host: read("DEV_HOST") || "localhost",
      port: numberEnv(read("WEB_DEV_PORT"), 5173),
      strictPort: true,
      proxy: devProxy,
    },
    preview: {
      host: read("DEV_HOST") || "localhost",
      port: numberEnv(read("WEB_PREVIEW_PORT"), 4173),
      strictPort: true,
      proxy: previewProxy,
    },
  };
});
