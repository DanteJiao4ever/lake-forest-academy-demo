import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/lake-forest-academy-demo/",
  plugins: [react()],
  build: {
    rolldownOptions: {
      input: {
        home: resolve(root, "index.html"),
        academics: resolve(root, "academics/index.html"),
        courses: resolve(root, "courses/index.html"),
        admissions: resolve(root, "admissions/index.html"),
      },
    },
  },
});

