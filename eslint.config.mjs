import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    files: ["**/*.{jsx,tsx}"],
    rules: {
      "react/jsx-no-literals": ["error", { noStrings: true, ignoreProps: true }],
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/shared/hooks/*"],
              message: "Import shared hooks only from module barrel: '@/shared/hooks'.",
            },
            {
              group: ["@/shared/config/*"],
              message: "Import shared config only from module barrel: '@/shared/config'.",
            },
            {
              group: ["@/shared/lib/*"],
              message: "Import shared lib only from module barrel: '@/shared/lib'.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
