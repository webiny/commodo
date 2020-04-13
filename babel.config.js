module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                debug: false,
                targets: {
                    browsers: ["last 3 versions"]
                }
            }
        ],
        ["@babel/preset-flow"]
    ],
    plugins: ["@babel/plugin-transform-runtime"]
};
