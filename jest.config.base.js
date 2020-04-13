const { basename } = require("path");
const merge = require("merge");

module.exports = ({ path }, presets = []) => {
    const dir = process.env.SOURCE_DIR || "src";
    const name = basename(path);

    return merge.recursive(...presets, {
        name: name,
        displayName: name,
        testRegex: `packages/.*/.*test.js$`,
        testEnvironment: "node",
        moduleDirectories: ["node_modules"],
        moduleNameMapper: {
            [`^@commodo/${name}/(.*)$`]: `${path}/${dir}/$1`,
            [`^@commodo/${name}$`]: `${path}/${dir}`
        }
    });
};
