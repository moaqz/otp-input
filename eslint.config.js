import moaqz from "eslint-config-moaqz";

export default [
  ...moaqz,
  {
    ignores: ["playwright-report", "test-results", "dist"]
  }
];
