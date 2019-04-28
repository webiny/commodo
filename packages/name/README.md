# @commodo/name

Use `withName` higher order function to assign a name of the model.

## Example

```
import { withName } from "@commodo/name";
import { compose } from "ramda";

// Define two models and assign a name to them.
const User = compose(
  withName("User"),
  ...
)(function() {});

const Company = compose(
  withName("Company"),
  ...
)(function() {});
```

## Helper functions

Use `hasName` and `getName` functions to determine if the object has a name assigned (using `withName`) and get the value.

```
import { withName } from "@commodo/name";
import { compose } from "ramda";

// Define two models and assign a name to them.
const Unknown = function() {};
const User = compose(
  withName("User"),
  ...
)(function() {});

// The Unknown function doesn't have a name assigned.
console.log(hasName(Unknown)); // false

console.log(hasName(User)); // true
console.log(getName(User)); // "User"
```
