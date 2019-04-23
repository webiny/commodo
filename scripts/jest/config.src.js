const baseConfig = require("./config.base");
const listPackages = require("./../utils/listPackages");

// Create a module map to point packages to the build output
const moduleNameMapper = {};
listPackages().forEach(name => {
    // Named entry points
    moduleNameMapper[`^@commodo/${name}/(.*)$`] = `<rootDir>packages/${name}/src/$1`;
    moduleNameMapper[`^@commodo/${name}$`] = `<rootDir>packages/${name}/src`;
});

module.exports = Object.assign({}, baseConfig, {
    moduleNameMapper
});
