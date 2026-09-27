import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/e2e/"],
  collectCoverageFrom: ["src/lib/**/*.{ts,tsx}"],
  coverageThreshold: {
    global: {},
    "src/lib/**/*.{ts,tsx}": {
      lines: 90,
    },
  },
};

export default createJestConfig(config);
