module.exports = {
    parser: {
        plugins: ["jsx", "classProperties", "dynamicImport", "throwExpressions", "flow"]
    },
    ignore: {
        src: ["path", "os", "fs", "util", "events", "crypto", "aws-sdk"],
        dependencies: ["@babel/runtime"],
        devDependencies: true
    },
    ignoreDirs: ["node_modules", "dist"],
    packages: ["packages/*"]
};
