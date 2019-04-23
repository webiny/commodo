const execa = require("execa");
const chalk = require("chalk");

const NPM_REGISTRY = "http://localhost:4873";

(async function() {
    console.log(chalk.green("Building all packages..."));
   await execa("lerna", ["run", "build"]).stdout.pipe(process.stdout);

    console.log(chalk.green("Testing ..."));
    await execa("yarn", ["test:jest:dist"]).stdout.pipe(process.stdout);

    // console.log(response)
    //console.log(chalk.green('Starting Verdaccio...'));

    // console.log(chalk.green('Publishing packages to NPM...'));
    // await execa("lerna", ["publish", "--conventional-commits", "--yes", ]).stdout.pipe(process.stdout);
})();
