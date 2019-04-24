const execa = require("execa");

execa.shellSync("lerna exec -- rm -rf dist");
execa.shellSync("lerna run build");

const files = ["package.json", "README.md"];
for (let i = 0; i < files.length; i++) {
    let file = files[i];
    execa.shellSync(`lerna exec -- cp ${file} dist/${file}`);
}
