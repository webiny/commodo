# Commodo - composable model objects

[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/webiny/webiny-js/blob/master/LICENSE)
[![SemVer](http://img.shields.io/:semver-2.0.0-brightgreen.svg)](http://semver.org)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

Commodo is a set of [higher order functions](https://en.wikipedia.org/wiki/Higher-order_function) that let you define and **com**pose rich data **mod**el **o**bjects.

## Quick example
```javascript
// Import needed higher order functions.
import { withFields, string, number, boolean, object, onSet } from "@commodo/fields";
import { withName } from "@commodo/name";
import { withHooks } from "@commodo/hooks";
import { withStorage } from "@commodo/fields-storage";
import { MongoDbDriver, withId } from "@commodo/fields-storage-mongodb";
import { compose } from "ramda";

// Define User and Verification models.
const Verification = compose(
  withFields({
    verified: boolean(),
    verifiedOn: string()
  })
)(function() {});

const User = compose(
  withFields({
    firstName: string(),
    lastName: string(),
    email: compose(
      onSet(value => value.toLowerCase())
    )(string()),
    age: number(),
    scores: number({ list: true }),
    enabled: boolean({ value: false }),
    verification: object({ instanceOf: Verification })
  }),
  withHooks({
    async beforeCreate() {
      if (await User.count({ query: { email: this.email } })) {
        throw Error("User with same e-mail already exists.");
      }
    }
  }),
  withName("User"), // Utilized by storage layer, to determine collection / table name.
  withId(),
  withStorage({
    driver: new MongoDbDriver({ database })
  })
)(function() {});

const user = new User();
user.populate({
  firstName: "Adrian",
  lastName: "Smith",
  email: "aDrIan@google.com",
  enabled: true,
  scores: [34, 66, 99],
  verification: {
    verified: true,
    verifiedOn: "2019-01-01"
  }
});

await user.save();
```

## Core packages:

| Package | Short Description |
| :--- | :---: |
| [@commodo/fields](./packages/fields) | The starting point of every model. Provides base `string`, `number`, `boolean` and `model` fields. |
| [@commodo/name](./packages/name) | Assign a name to your models. |
| [@commodo/hooks](./packages/hooks) | Provides methods for defining and triggering hooks on your models. |
| [@commodo/fields-storage](./packages/fields-storage) | Enables saving models, for example to a MongoDB or MySQL database. |

## Additional packages:

| Package | Short Description |
| :--- | :---: |
| [@commodo/fields-storage-ref](./packages/fields-storage-ref) | Provides `ref` field, for saving references to other models saved in database. |
| [@commodo/fields-storage-mongodb](./packages/fields-storage-mongodb) | A MongoDB driver for @commodo/fields-storage package. |

## Community packages:

| Package | Short Description |
| :--- | :---: |
| [commodo-fields-date](./packages/fields-storage-ref) | Provides `date` field, for saving dates. |

## Contributing
Please see our [Contributing Guideline](/CONTRIBUTING.md) which explains repo organization, linting, testing, and other steps.

## License
This project is licensed under the terms of the [MIT license](/LICENSE.md).

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars0.githubusercontent.com/u/5121148?v=4" width="100px;"/><br /><sub><b>Adrian Smijulj</b></sub>](https://github.com/doitadrian)<br />[💻](https://github.com/doitadrian/react-hotkeyz/commits?author=doitadrian "Code") [📖](https://github.com/doitadrian/react-hotkeyz/commits?author=doitadrian "Documentation") [💡](#example-doitadrian "Examples") [👀](#review-doitadrian "Reviewed Pull Requests") [⚠️](https://github.com/doitadrian/react-hotkeyz/commits?author=doitadrian "Tests") |
| :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
