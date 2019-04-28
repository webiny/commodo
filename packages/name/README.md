# @commodo/name

Use `withName` higher order function to create a new function with a name assigned to it.

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

Additionaly, use `hasName` function to determine if a function or an instance of a function has a name and when needed, `getName` function get the actual value.

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

##### `withName(name: string): Function`
Returns a new function with a name assigned to it and all of its instances.

##### `hasName(any): boolean`
Checks if a passed value has a name assigned.

##### `getName(any): string`
Returns a name assigned to the passed value.
