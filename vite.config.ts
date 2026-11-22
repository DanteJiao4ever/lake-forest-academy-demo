import react from "@vitejs/plugin-react";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv, type Plugin } from "vite";

const root = dirname(fileURLToPath(import.meta.url));

function learningRuntimeConfigPlugin(
  values: Record<string, string>,
): Plugin {
  let outputDirectory = resolve(root, "dist");
  return {
    name: "learning-runtime-config",
    apply: "build",
    configResolved(config) {
      outputDirectory = resolve(root, config.build.outDir);
    },
    async closeBundle() {
      const requestedTimeout = Number(values.LFA_API_HEALTH_TIMEOUT_MS);
      const runtimeConfig = {
        apiOrigin: values.LFA_API_ORIGIN || "",
        healthPath: values.LFA_API_HEALTH_PATH || "/health/ready",
        uploadHealthPath:
          values.LFA_API_UPLOAD_HEALTH_PATH || "/health/upload-ready",
        workspaceAuthHealthPath:
          values.LFA_WORKSPACE_AUTH_HEALTH_PATH ||
          "/health/workspace-auth-ready",
        healthTimeoutMs: Number.isFinite(requestedTimeout)
          ? Math.min(10000, Math.max(1000, Math.round(requestedTimeout)))
          : 3500,
        googleWorkspaceAuthStart: values.LFA_GOOGLE_AUTH_START || "",
        driveSyncPath: values.LFA_DRIVE_SYNC_PATH || "",
      };
      const destination = resolve(
        outputDirectory,
        "learning/runtime-config.json",
      );
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, `${JSON.stringify(runtimeConfig, null, 2)}\n`);
    },
  };
}

export default defineConfig(({ mode }) => {
  const learningEnv = loadEnv(mode, root, "LFA_");
  return {
    // Relative asset URLs keep both the custom domain and the original
    // GitHub Pages project URL working during DNS propagation.
    base: "./",
    server: { fs: { deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "**/backend/src/lessons/**"] } },
    plugins: [
      react(),
      learningRuntimeConfigPlugin(learningEnv),
      {
        name: "learning-sample-dev-entry",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const path = req.url?.split("?")[0];
            if (path === "/learning/" || path === "/learning/index.html") {
              try {
                const html = await readFile(resolve(root, "public/learning/index.html"), "utf8");
                res.setHeader("Content-Type", "text/html;charset=utf-8");
                res.end(await server.transformIndexHtml("/learning/index.html", html));
              } catch (error) {
                next(error);
              }
              return;
            }
            if (path === "/learning/assets/reading-sample.js") {
              req.url = "/src/learning/standalone.tsx";
            }
            next();
          });
        },
      },
    ],
    build: {
      rolldownOptions: {
        input: {
          home: resolve(root, "index.html"),
          academics: resolve(root, "academics/index.html"),
          courses: resolve(root, "courses/index.html"),
          admissions: resolve(root, "admissions/index.html"),
          "reading-sample": resolve(root, "src/learning/standalone.tsx"),
        },
        output: {
          entryFileNames: (entry) => entry.name === "reading-sample"
            ? "learning/assets/reading-sample.js"
            : "assets/[name]-[hash].js",
        },
      },
    },
  };
});
