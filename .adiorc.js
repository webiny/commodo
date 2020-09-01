module.exports = {
    parser: {
        plugins: ["jsx", "classProperties", "dynamicImport", "throwExpressions"]
    },
    ignore: {
        src: ["path", "os", "fs", "util", "events", "crypto"],
        dependencies: ["@babel/runtime"],
        devDependencies: true
    },
    ignoreDirs: ["node_modules", "dist"],
    packages: ["packages/*"]
};
