import globals from "globals";
import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";
import { fileURLToPath } from "node:url";
import { builtinModules } from "node:module";

const tsconfigRootDir = fileURLToPath(new URL(".", import.meta.url));
const sharedGlobals = Object.fromEntries(
  Object.entries(globals.browser).filter(([name]) =>
    Object.hasOwn(globals.node, name),
  ),
);

export default defineConfig([
  {
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...eslint.configs.recommended.rules, // Include recommended JS rules
    },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["src/**/*.ts", "tests/**/*.ts"],
  })),
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["src/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: builtinModules.filter((name) => !name.startsWith("node:")),
          patterns: ["node:*"],
        },
      ],
    },
    languageOptions: {
      globals: sharedGlobals,
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
  },
  {
    files: ["tests/**/*.ts"],
    languageOptions: {
      globals: { ...globals.node, ...globals.vitest },
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.tests.json",
        tsconfigRootDir,
      },
    },
  },
  {
    // Global ignore patterns
    ignores: [
      "dist",
      ".worktrees/**",
      "docs",
      ".yarn",
      "node_modules",
      "**/node_modules",
      "src/schemas",
      "coverage",
      "vitest.config.ts",
    ],
  },
]);
