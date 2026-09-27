import nextConfig from "eslint-config-next/core-web-vitals";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = [
  ...nextConfig,
  eslintConfigPrettier,
  {
    ignores: [
      "out/**",
      "out-subpath-root/**",
      ".next/**",
      "playwright-report/**",
      "test-results/**",
      "coverage/**",
    ],
  },
  {
    // web-platform: "No backend" - no library, font or asset from a third-party origin or CDN.
    files: ["app/**/*.{ts,tsx}", "src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/font/google",
              message: "No third-party fonts: use the system font stack instead (web-platform: No backend).",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/^(https?:)?\\/\\//]",
          message: "No hard-coded third-party origins allowed (web-platform: No backend).",
        },
      ],
    },
  },
];

export default eslintConfig;
