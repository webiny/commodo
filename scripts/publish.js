const execa = require("execa");
const chalk = require("chalk");

const VERDACCIO_NPM_REGISTRY = "http://localhost:4873";

(async function() {
    console.log(chalk.green("Building all packages..."));
    await execa.shell("lerna exec -- rm -rf dist", ["exec", "--", "rm", "-rf", "dist"]);
    await execa.shell("lerna run build");

    // TODO: publish to Verdaccio
    // console.log(chalk.green('Publishing packages to Verdaccio...'));
    // await execa("lerna", ["publish", "--conventional-commits", "--yes", ]).stdout.pipe(process.stdout);

    // TODO: test with Verdaccio
    // console.log(chalk.green("Testing ..."));
    // await execa("yarn", ["test:jest:dist"]).stdout.pipe(process.stdout);

    console.log(chalk.green("Creating a new version..."));
    const { stdout, stderr } = await execa.shell("lerna version --conventional-commits --yes");

    // TODO: What if error?
    console.log(chalk.red(stderr));
    console.log(stdout);

    console.log(chalk.green("Copying non-code files..."));
    const files = ["package.json", "README.md"];
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        await execa.shell(`lerna exec -- cp ${file} dist/${file}`);
    }

    console.log(chalk.green("Publishing to NPM..."));
    const publishResults = await execa.shell(
        "lerna publish --conventional-commits --yes --contents dist"
    );

    if (publishResults.stderr) {
        console.log(chalk.red(publishResults.stderr));
    } else {
        console.log(publishResults.stdout);
    }
})();
