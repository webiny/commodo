# @commodo/name [![](https://img.shields.io/npm/v/@commodo/name.svg)](https://www.npmjs.com/package/@commodo/name)
Decorates a function (and its instances) with a name, that can be used for various purposes. 

For example, the [`@commodo/fields-storage`](../fields-storage) package relies on the name in order to determine the database table in which the data will be saved.

## Usage

```js
import { withName } from "@commodo/name";
import { compose } from "ramda";

const User = compose(
  withName("User"),
  (...)
)();

const Company = compose(
  withName("Company"),
  (...)
)();
```

You can then use the `hasName` and `getName` functions in order to determine if a name was assigned to the passed value, or to get the actual name that was assigned, respectively.

```js
import { withName, hasName, getName } from "@commodo/name";
import { compose } from "ramda";

// A function with a name assigned.
const User = compose(
  withName("User"),
  (...)
)();

// A function without a name assigned.
const Unknown = compose(
  // Name not assigned.
  // withName("Unknown"), 
  (...)
)();

console.log(hasName(User)); // true
console.log(getName(User)); // "User"

// The Unknown function doesn't have a name assigned.
console.log(hasName(Unknown)); // false
console.log(getName(Unknown)); // ""

// Also works on function instances.
const user = new User();
console.log(hasName(user)); // true
console.log(getName(user)); // "User"

const unknown = new Unknown();
console.log(hasName(unknown)); // false
console.log(getName(unknown)); // ""
```

## Reference

#### `withName(name: string): Function`
Decorates a function (and its instances) with a name.

#### `hasName(value: any): boolean`
Checks if the passed value has a name assigned via the `withName`.

#### `getName(value: any): string`
Returns a name assigned to the passed value. Returns empty string if none assigned.
