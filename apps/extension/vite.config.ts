import path from "node:path";
import { fileURLToPath } from "node:url";
import { crx } from "@crxjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import manifest from "./manifest.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
    tailwindcss(),
    {
      name: "stub-ws",
      enforce: "pre",
      resolveId(source) {
        if (source === "ws") {
          console.log("Stubbing 'ws' module resolution!");
          return "\0ws";
        }
        return null;
      },
      load(id) {
        if (id === "\0ws") {
          console.log("Loading 'ws' stub content!");
          return "export default {}";
        }
        return null;
      },
    },
  ],

  envPrefix: "NEXT_PUBLIC_", // Expose NEXT_PUBLIC_ variables
  resolve: {
    mainFields: ["browser", "module", "main"], // Force browser build
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@overlay": path.resolve(__dirname, "./src/content/ui"),
      "@background": path.resolve(__dirname, "./src/background"),
      "@content": path.resolve(__dirname, "./src/content"),
      // Explicit alias as backup
      ws: path.resolve(__dirname, "./src/shared/lib/ws-stub.ts"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        overlay: path.resolve(__dirname, "src/overlay/index.html"),
      },
    },
  },
});
