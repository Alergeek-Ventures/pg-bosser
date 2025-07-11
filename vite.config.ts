import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "PgBosser",
      fileName: (format) => `pg-bosser.${format}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["pg-boss", "events"],
      output: {
        globals: {
          "pg-boss": "PgBoss",
          events: "events",
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
  plugins: [
    dts({
      include: ["src/**/*"],
      exclude: ["**/*.test.*", "**/*.spec.*"],
    }),
  ],
});
