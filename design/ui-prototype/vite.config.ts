import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  cacheDir: "/tmp/cadenza-ui-prototype-vite-cache",
  plugins: [react()],
  preview: {
    host: "127.0.0.1",
    port: 4177,
    strictPort: true,
  },
  server: {
    host: "127.0.0.1",
    port: 4177,
    strictPort: true,
  },
});
