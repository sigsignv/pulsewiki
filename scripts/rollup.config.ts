import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

export default defineConfig({
  input: "src/index.ts",
  output: {
    file: "../skin/bundle.js",
    format: "iife",
  },
  plugins: [
    typescript(),
    replace({
      "import.meta.vitest": "undefined",
    }),
  ],
});
