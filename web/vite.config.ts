import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import type { ProxyOptions } from "vite";
import { defineConfig } from "vitest/config";

const BASE_PORT = 3000;
const pendulumCount = Number(process.env.VITE_PENDULUM_COUNT ?? 1);
const ids = Array.from({ length: pendulumCount }, (_, index) => index + 1);

function pendulumProxy(id: number): [string, ProxyOptions] {
  return [
    `/api/${id}/`,
    {
      target: `http://localhost:${BASE_PORT + id}`,
      rewrite: (path) => path.replace(`/api/${id}`, ""),
    },
  ];
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("../shared/index.ts", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: Object.fromEntries(ids.map(pendulumProxy)),
  },
  test: {
    environment: "jsdom",
  },
});
