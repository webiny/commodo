const execa = require("execa");
const chalk = require("chalk");

const VERDACCIO_NPM_REGISTRY = "http://localhost:4873";

(async function() {
    console.log(chalk.green("Building all packages..."));
    await execa("lerna", ["exec", "--", "rm", "-rf", "dist"]);

    await execa("lerna", ["run", "build"]);
    // TODO: publish to Verdaccio
    // console.log(chalk.green('Publishing packages to Verdaccio...'));
    // await execa("lerna", ["publish", "--conventional-commits", "--yes", ]).stdout.pipe(process.stdout);

    // TODO: test with Verdaccio
    // console.log(chalk.green("Testing ..."));
    // await execa("yarn", ["test:jest:dist"]).stdout.pipe(process.stdout);

    // console.log(response)
    //console.log(chalk.green('Starting Verdaccio...'));

    console.log(chalk.green("Copying non-code files..."));
    await execa("lerna", ["exec", "--", "cp", "package.json", "dist/package.json"]).stdout.pipe(
        process.stdout
    );

    console.log(chalk.green("Publishing packages..."));
    await execa("lerna", [
        "publish",
        "--conventional-commits",
        "--yes",
        "--contents",
        "dist"
    ]).stdout.pipe(process.stdout);
})();
