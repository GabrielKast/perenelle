import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: ["dist/"] },
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
  {
    files: ["src/domain/**/*.ts"],
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
              group: ["**/application/**", "**/ports/**", "**/adapters/**"],
              message: "The domain must not depend on outer layers.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/application/**/*.ts", "src/ports/**/*.ts"],
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
              group: ["**/adapters/**"],
              message: "Application and ports must not depend on adapters.",
            },
          ],
        },
      ],
    },
  },
);
