module.exports = {
    testEnvironment: "node",
    verbose: true,
    testMatch: ["**/tests/**/*.test.js"],
    moduleDirectories: ["node_modules", "src"],
    collectCoverage: true,
    coverageReporters: ["text", "lcov"],
};