// @flow
const path = require("path");
const getPackages = require("get-yarn-workspaces");
const minimatch = require("minimatch");

const baseBlacklist = [];

module.exports = (blacklist = []) => {
    const finalBlackList = [...baseBlacklist, ...blacklist];
    return getPackages(process.cwd())
        .filter(p => !finalBlackList.some(s => minimatch(path.basename(p), s)))
        .map(p => path.basename(p));
};
