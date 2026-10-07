import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

// Tests may use node:test, node:assert, etc. in any layer.
const tests = ["**/*.test.ts"];

export default defineConfig(
  { ignores: ["**/dist/"] },
  eslint.configs.recommended,
  {
    files: ["**/*.ts"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // node:test's describe/it return promises that the runner already tracks.
      "@typescript-eslint/no-floating-promises": [
        "error",
        {
          allowForKnownSafeCalls: [
            {
              from: "package",
              package: "node:test",
              name: ["describe", "it", "test"],
            },
          ],
        },
      ],
    },
  },

  // Architecture boundaries (see CLAUDE.md).
  // A later config object replaces the rule options of an earlier one for the
  // same file, so each object lists every restriction that applies to it.
  {
    files: ["packages/core/src/**/*.ts"],
    ignores: tests,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["node:*"],
              message: "Infrastructure access belongs in adapters.",
            },
            {
              group: ["@perenelle/*", "perenelle"],
              message: "Core must not depend on adapters or clients.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/core/src/domain/**/*.ts"],
    ignores: tests,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^[^.]",
              message:
                "The domain must not depend on Node.js or external packages.",
            },
            {
              group: ["**/application/**", "**/ports/**"],
              message: "The domain must not depend on outer layers.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/settings/src/**/*.ts", "packages/docker/src/**/*.ts"],
    ignores: tests,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@perenelle/*", "!@perenelle/core", "perenelle"],
              message: "Adapters may depend on core only, not on each other.",
            },
          ],
        },
      ],
    },
  },
);
