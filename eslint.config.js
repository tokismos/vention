import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["**/node_modules", "**/dist"]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ regex: "^\\.\\./", message: "Use the @/ alias instead of ../" }] },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    files: ["server/**/*.ts", "*.config.{js,ts}", "**/*.config.{js,ts}"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["web/src/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
  },
  prettier,
]);
