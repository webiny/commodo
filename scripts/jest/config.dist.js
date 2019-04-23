const baseConfig = require("./config.base");
const getYarnWorkspaces = require("get-yarn-workspaces");

// Create a module map to point packages to the build output
const moduleNameMapper = {};

getYarnWorkspaces()
    .map(item => {
        const parts = item.split("/");
        return parts[parts.length - 1];
    })
    .forEach(name => {
        // Named entry points
        moduleNameMapper[`^@commodo/${name}/(.*)$`] = `<rootDir>packages/${name}/dist/$1`;
        moduleNameMapper[`^@commodo/${name}$`] = `<rootDir>packages/${name}/dist`;
    });

module.exports = Object.assign({}, baseConfig, {
    moduleNameMapper
});
