import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const repoName = "smart-health-monitoring-system";
const apiTarget = process.env.VITE_API_TARGET || "http://localhost:8000";
const apiProxy = {
  "/api": {
    target: apiTarget,
    changeOrigin: true,
    secure: false,
  },
};

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? `/${repoName}/` : "/",
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: Number(process.env.FRONTEND_PORT || 3004),
    proxy: apiProxy,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    proxy: apiProxy,
  },
}));
