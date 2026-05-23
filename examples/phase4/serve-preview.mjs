import { mkdir, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const exampleDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(exampleDir, "../..");
const host = process.env.CADENZA_PHASE4_PREVIEW_HOST ?? "127.0.0.1";
const port = Number(process.env.CADENZA_PHASE4_PREVIEW_PORT ?? "4174");
const bundlePath = path.join(repoRoot, "tmp", "phase4-dogfood-preview.js");

await mkdir(path.dirname(bundlePath), { recursive: true });
await esbuild.build({
  absWorkingDir: repoRoot,
  bundle: true,
  entryPoints: ["examples/phase4/preview.jsx"],
  format: "esm",
  nodePaths: [path.join(repoRoot, "packages/preview-remotion/node_modules")],
  outfile: bundlePath,
  platform: "browser",
  plugins: [workspaceAliasPlugin()],
  sourcemap: "inline",
  tsconfig: path.join(repoRoot, "tsconfig.json"),
});

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${host}:${port}`);

  if (requestUrl.pathname === "/" || requestUrl.pathname === "/index.html") {
    await sendFile(response, path.join(exampleDir, "index.html"), "text/html");
    return;
  }

  if (requestUrl.pathname === "/phase4-dogfood-preview.js") {
    await sendFile(response, bundlePath, "text/javascript");
    return;
  }

  response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  response.end("Not found");
});

server.listen(port, host, () => {
  console.log(`Cadenza Phase 4 dogfood preview: http://127.0.0.1:${port}/`);
});

process.on("SIGINT", () => {
  server.close(() => {
    process.exit(0);
  });
});

async function sendFile(response, filePath, contentType) {
  const body = await readFile(filePath);
  response.writeHead(200, {
    "cache-control": "no-store",
    "content-type": `${contentType}; charset=utf-8`,
  });
  response.end(body);
}

function workspaceAliasPlugin() {
  const aliases = new Map([
    ["@cadenza-dev/core", "packages/core/src/index.ts"],
    [
      "@cadenza-dev/core/jsx-dev-runtime",
      "packages/core/src/jsx-dev-runtime.ts",
    ],
    ["@cadenza-dev/core/jsx-runtime", "packages/core/src/jsx-runtime.ts"],
    ["@cadenza-dev/preview-remotion", "packages/preview-remotion/src/index.ts"],
  ]);

  return {
    name: "cadenza-workspace-alias",
    setup(build) {
      build.onResolve({ filter: /^@cadenza-dev\/.+/ }, (args) => {
        const target = aliases.get(args.path);

        if (!target) {
          return undefined;
        }

        return { path: path.join(repoRoot, target) };
      });
    },
  };
}
