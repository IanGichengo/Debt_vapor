module.exports = {
  testEnvironment: "node",
  clearMocks: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/modules/**/*.js",
    "!src/modules/**/authRoutes.js",
    "!src/modules/**/authValidation.js",
  ],
};
