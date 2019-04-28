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
  withName("User"),
  ...
)(function() {});
```
