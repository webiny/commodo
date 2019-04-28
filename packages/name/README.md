# @commodo/name

Use `withName` higher order function to assign a name to objects.

## Usage

```js
import { withName } from "@commodo/name";
import { compose } from "ramda";

// Define two models and assign a name to them.
const User = compose(
  withName("User"),
  (...)
)(function() {});

const Company = compose(
  withName("Company"),
  (...)
)(function() {});
```

Additionaly, use `hasName` and `getName` functions to determine if the object / `Function` object has a name assigned to it (using `withName`) and of course get the value when needed.

```js
import { withName, hasName, getName } from "@commodo/name";
import { compose } from "ramda";

// Create two functions and only assign a name to the second one.
const Unknown = function() {};
const User = compose(
  withName("User"),
  (...)
)(function() {});

// The Unknown object doesn't have a name assigned.
console.log(hasName(Unknown)); // false

console.log(hasName(User)); // true
console.log(getName(User)); // "User"

// It also works on instantiated objects.
const user = new User();

console.log(hasName(user)); // true
console.log(getName(user)); // "User"
```

## Reference

#### `withName(name: string): Function`
#### `hasName(any): boolean`
#### `getName(any): string`
