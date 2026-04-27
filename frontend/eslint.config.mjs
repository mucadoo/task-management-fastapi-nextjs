import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
const nextFlat = nextPlugin.configs;
import unusedImports from "eslint-plugin-unused-imports";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import { globalIgnores } from "eslint/config";

export default [
  // Global ignores
  globalIgnores([
    "eslint.config.mjs",
    "postcss.config.mjs",
    ".next/**",
    "out/**",
    "build/**",
    "node_modules/**",
    "next-env.d.ts",
    "public/**",
    "coverage/**",
  ]),

  // Base + Next.js (includes React + React Hooks rules)
  js.configs.recommended,
  ...nextFlat.recommended.rules ? [nextFlat.recommended] : [],
  ...nextFlat["core-web-vitals"].rules ? [nextFlat["core-web-vitals"]] : [],

  // TypeScript type-aware rules
  ...tseslint.configs.recommendedTypeChecked,

  // Main project config
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        // Modern & faster alternative (recommended in 2026)
        projectService: true,
        // Keep tsconfigRootDir only if you still need it for some rules
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "unused-imports": unusedImports,
      // Uncomment only if you get "@next/next" plugin not found warnings
      // "@next/next": nextFlat.plugin,
    },
    rules: {
      // Disable conflicting unused-vars rules
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",

      // Unused imports (excellent autofix)
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // Your custom rules
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  // Prettier — must be last
  prettierRecommended,
];