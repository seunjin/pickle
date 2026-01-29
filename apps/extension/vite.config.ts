import path from "node:path";
import { fileURLToPath } from "node:url";
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import manifest from "./manifest.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
// Tailwind is handled via PostCSS (see postcss.config.mjs) - same as Web app
export default defineConfig(() => {
  // 크롬 웹스토어 심사 제출용 빌드 시에만 manifest에서 key 필드를 제거합니다.
  // 일반적인 로컬 빌드(pnpm build:extension)에서는 아이디 고정을 위해 key를 유지합니다.
  const manifestData = { ...manifest };
  const isWebstoreBuild = process.env.VITE_WEBSTORE_BUILD === "true";

  if (isWebstoreBuild) {
    delete (manifestData as any).key;
  }

  return {
    plugins: [
      react(),
      crx({ manifest: manifestData as any }),
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

    // CSS: PostCSS handles Tailwind, Lightning CSS is only used for minification
    // Note: css.transformer: "lightningcss" would bypass PostCSS, so we DON'T use it
    css: {
      // PostCSS is automatically used (postcss.config.mjs)
    },

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
        // Force single instance of React
        react: path.resolve(__dirname, "./node_modules/react"),
        "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
        // Explicit alias as backup
        ws: path.resolve(__dirname, "./src/shared/lib/ws-stub.ts"),
      },
    },
    build: {
      rollupOptions: {
        input: {
          overlay: path.resolve(__dirname, "src/overlay/index.html"),
          content: path.resolve(__dirname, "src/content/index.ts"),
        },
        output: {
          entryFileNames: "assets/[name].js",
          chunkFileNames: "assets/[name].js",
          assetFileNames: "assets/[name].[ext]",
        },
      },
      // Use Lightning CSS for production build as well
      cssMinify: "lightningcss",
    },
  };
});
