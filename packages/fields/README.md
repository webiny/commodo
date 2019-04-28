# @commodo/fields
Creates a new function, whose instances are decorated with defined fields and additional methods.

## Example
```js
import { withFields, string, number, boolean, fields } from "@commodo/fields";
import { compose } from "ramda";

const User = compose(
   withFields({
        email: string(),
        previousEmails: string({ list: true }),
        age: number(),
        verified: boolean(),
        company: fields({ instanceOf: Company })
    })
)(function() {});

const Company = compose(
   withFields({
        name: string()
   })
)(function() {});
```

## Reference

##### `withFields(fields : { [string] : Field }): Function`
Creates a new function, whose instances contain defined fields and are decorated with `populate` and `validate` methods.

### `WithHooksFunction`

Instances of `WithHooksFunction` are decorated with `hook` and `registerHookCallback` methods.

##### `hook(name: string): Promise<void>`
Calls a hook or in other words, executes all registered hook callbacks.

##### `registerHookCallback(name: string, callback: Function)`
Registers a callback for given hook. Useful when registering hooks inside of custom methods.
