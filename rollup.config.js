import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json" assert { type: "json" };

export default {
  input: "./src/index.ts",
  output: [
    // 1. cjs -> commonjs
    {
      format: "cjs",
      file: pkg.main,
    },
    // 2. es -> es module
    {
      format: "es",
      file: pkg.module,
    },
  ],
  plugins: [typescript()],
};
