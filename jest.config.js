const workspaces = require("get-yarn-workspaces")();

const projects = workspaces.map(pkg => pkg.replace(process.cwd() + "/", ""));

module.exports = {
    rootDir: process.cwd(),
    projects,
    modulePathIgnorePatterns: ["dist"],
    collectCoverageFrom: [`src/**/*.js`],
    coverageReporters: ["text", "lcov", "html"]
};
