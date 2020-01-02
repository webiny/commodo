const mongoDbPreset = require("@shelf/jest-mongodb/jest-preset");

module.exports = {
    rootDir: process.cwd(),
    testRegex: `packages/.*/.*test.js$`,
    collectCoverageFrom: [`packages/**/src/**/*.js`],
    coverageReporters: ["lcov", "html"],

    ...mongoDbPreset
    // TODO: Add more presets here, e.g. "@shelf/jest-dynamodb"?
    // TODO: If you do this, make sure all of the presets are merged correctly.
};
