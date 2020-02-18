# Commodo - composable model objects

[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/webiny/webiny-js/blob/master/LICENSE)
[![SemVer](http://img.shields.io/:semver-2.0.0-brightgreen.svg)](http://semver.org)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Gitter](https://img.shields.io/gitter/room/webiny/webiny-js.svg?style=flat-square)](https://gitter.im/webiny/webiny-js)

Commodo is a set of [higher order functions (HOFs)](https://en.wikipedia.org/wiki/Higher-order_function) that let you define and **com**pose rich data **mod**el **o**bjects.

## Quick example

##### A simple model
The following example shows how to create a simple data model, which you can later use to validate data (e.g. data received as body of an HTTP request):

```javascript
import { withFields, string, number, boolean } from "@commodo/fields";

const Animal = withFields({
    name: string({
        validate: value => {
            if (!value) {
                throw Error("A pet must have a name!");
            }
        }
    }),
    age: number(),
    isAwesome: boolean(),
    about: fields({
        value: {},
        instanceOf: withFields({
            type: string({ value: "cat" }),
            dangerous: boolean({ value: true })
        })()
    })
})();

const animal = new Animal();
animal.populate({ age: "7" }); // Throws data type error, cannot populate a string with number.

animal.populate({ age: 7 });
await animal.validate(); // Throws a validation error - name must be defined.

animal.name = "Garfield";
await animal.validate(); // All good.
```

##### More complex model
Using other HOFs, you can create more complex models, that have a name, attached hooks, and even storage layer, so that you can easily save the data to the database:

```javascript
import { withFields, string, number, boolean, fields, onSet } from "@commodo/fields";
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
)();

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
    verification: fields({ instanceOf: Verification })
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
)();

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

## Is Commodo an ORM/ODM?
Fundamentally, Commodo is not an ORM/ODM, but can very quickly become one, by utilizing an additional HOF. You can use the already provided [@commodo/fields-storage](https://github.com/webiny/commodo/tree/master/packages/fields-storage) or even create your own if you don't like the existing one.

Using HOFs is a very flexible approach for defining your data models, because you can append only the functionality you actually need and will use.

## Core packages:

The following section shows all of the useful higher order functions that you can use right now.

| Package | Short Description | Version |
| :--- | :---: | :---: |
| [@commodo/fields](./packages/fields) | The starting point of every model. Provides base `string`, `number`, `boolean` and `model` fields. | [![](https://img.shields.io/npm/v/@commodo/fields.svg)](https://www.npmjs.com/package/@commodo/fields) |
| [@commodo/name](./packages/name) | Assign a name to your models. | [![](https://img.shields.io/npm/v/@commodo/name.svg)](https://www.npmjs.com/package/@commodo/name) |
| [@commodo/hooks](./packages/hooks) | Provides methods for defining and triggering hooks on your models. | [![](https://img.shields.io/npm/v/@commodo/hooks.svg)](https://www.npmjs.com/package/@commodo/hooks) |
| [@commodo/fields-storage](./packages/fields-storage) | Enables saving models to a database (with an appropriate driver, e.g. MySQL). | [![](https://img.shields.io/npm/v/@commodo/fields-storage.svg)](https://www.npmjs.com/package/@commodo/fields-storage) |

## Additional packages:

| Package | Short Description | Version |
| :--- | :---: | :---: |
| [@commodo/fields-storage-ref](./packages/fields-storage-ref) | Provides `ref` field, for saving references to other models saved in database. | [![](https://img.shields.io/npm/v/@commodo/fields-storage-ref.svg)](https://www.npmjs.com/package/repropose) |
| [@commodo/fields-storage-mongodb](./packages/fields-storage-mongodb) | A MongoDB driver for @commodo/fields-storage package. | [![](https://img.shields.io/npm/v/@commodo/fields-storage-mongodb.svg)](https://www.npmjs.com/package/repropose) |
| [@commodo/fields-storage-soft-delete](./packages/fields-storage-soft-delete) | Introduces deleted boolean field to mark whether a model was deleted or not, instead of physically deleting the entry in the storage. | [![](https://img.shields.io/npm/v/@commodo/fields-storage-soft-delete.svg)](https://www.npmjs.com/package/@commodo/fields-storage-soft-delete) |

## Community packages:

| Package | Short Description | Version |
| :--- | :---: | :---: |
| [commodo-fields-date](https://github.com/doitadrian/commodo-fields-date) | Provides `date` field, for saving dates. | [![](https://img.shields.io/npm/v/commodo-fields-date.svg)](https://www.npmjs.com/package/commodo-fields-date) |
| [commodo-fields-object](https://github.com/doitadrian/commodo-fields-object) | Provides `object` field, for saving plain objects. | [![](https://img.shields.io/npm/v/commodo-fields-object.svg)](https://www.npmjs.com/package/commodo-fields-object) |
| [commodo-fields-int](https://github.com/doitadrian/commodo-fields-int) | Provides `int` field, for saving integer numbers. | [![](https://img.shields.io/npm/v/commodo-fields-int.svg)](https://www.npmjs.com/package/commodo-fields-int) |
| [commodo-fields-float](https://github.com/doitadrian/commodo-fields-float) | Provides `float` field, for saving float numbers. | [![](https://img.shields.io/npm/v/commodo-fields-float.svg)](https://www.npmjs.com/package/commodo-fields-float) |
| [commodo-fields-storage-crud-logs](https://github.com/doitadrian/commodo-fields-storage-crud-logs) | Adds and automatically manages `createdOn`, `updatedOn`, `savedOn` fields. | [![](https://img.shields.io/npm/v/commodo-fields-storage-crud-logs.svg)](https://www.npmjs.com/package/commodo-fields-storage-crud-logs) |

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
