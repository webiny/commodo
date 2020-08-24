// Comparison operators (A-Z)
const $beginsWith = require("./comparison/beginsWith");
const $between = require("./comparison/between");
const $gt = require("./comparison/gt");
const $gte = require("./comparison/gte");
const $lt = require("./comparison/lt");
const $lte = require("./comparison/lte");
const $eq = require("./comparison/eq");

module.exports = {
    $beginsWith,
    $between,
    $eq,
    $gt,
    $gte,
    $lt,
    $lte
};
