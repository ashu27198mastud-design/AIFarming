import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactPlugin from "eslint-plugin-react";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      react: reactPlugin,
    },
    rules: {
      "react/jsx-no-literals": [
        "error",
        {
          noStrings: true,
          allowedStrings: [],
          ignoreProps: true,
          noAttributeStrings: false,
        },
      ],
    },
  },
  {
    // Temporarily disable the literal strings check on legacy/pre-existing code
    files: [
      "src/components/**/*.tsx",
      "src/app/page.tsx",
      "src/app/dashboard/page.tsx",
      "src/app/privacy/page.tsx",
      "src/app/auth/callback/page.tsx",
    ],
    rules: {
      "react/jsx-no-literals": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

