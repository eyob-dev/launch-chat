import next from "eslint-config-next";

// eslint-config-next@16 ships a native flat-config array. We spread it and add
// ignore patterns for build output.
const eslintConfig = [
  ...next,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;

