# @commodo/name
Decorates a function with a given name.

## Usage

```js
import { withName } from "@commodo/name";
import { compose } from "ramda";

// Create two functions with a name assigned to them.
const User = compose(
  withName("User"),
  (...)
)();

const Company = compose(
  withName("Company"),
  (...)
)();
```

Use `hasName` or `getName` on a function to determine if it has a name or to get the value, respectively.

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
  // withName(), 
  (...)
)();

console.log(hasName(User)); // true
console.log(getName(User)); // "User"

// The Unknown function doesn't have a name assigned.
console.log(hasName(Unknown)); // false
console.log(getName(Unknown)); // ""

// Also works on a function instance.
const user = new User();

console.log(hasName(user)); // true
console.log(getName(user)); // "User"
```

## Reference

#### `withName(name: string): Function`
Decorates a function with a given name.

#### `hasName(value: any): boolean`
Checks if passed value has a name already assigned to it.

#### `getName(value: any): string`
Returns a name assigned to the passed value. Returns empty string if none assigned.
