module.exports = {
    rootDir: process.cwd(),
    testRegex: `packages/.*/.*test.js$`,
    collectCoverageFrom: [`packages/**/src/**/*.js`],
    coverageReporters: ["lcov", "html"],
    testEnvironment: "node"
};
