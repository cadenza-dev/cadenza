import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const pnpmRoot = resolve(repoRoot, "node_modules/.pnpm");

export default {
  root: fileURLToPath(new URL(".", import.meta.url)),
  cacheDir: "/tmp/cadenza-ui-prototype-vite-cache",
  server: {
    host: "127.0.0.1",
    port: 4177,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4177,
    strictPort: true,
  },
  resolve: {
    alias: {
      react: resolve(pnpmRoot, "react@19.2.5/node_modules/react"),
      "react-dom": resolve(
        pnpmRoot,
        "react-dom@19.2.5_react@19.2.5/node_modules/react-dom",
      ),
      "react-dom/client": resolve(
        pnpmRoot,
        "react-dom@19.2.5_react@19.2.5/node_modules/react-dom/client.js",
      ),
    },
  },
  esbuild: {
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
  },
};
