# @commodo/fields
Creates a new function, whose instances are decorated with defined fields and additional methods.

## Usage
```js
import { withFields, string, number, boolean, fields } from "@commodo/fields";
import { compose } from "ramda";

const User = compose(
   withFields({
      email: string(),
      previousEmails: string({ list: true }),
      age: number({
         validation: value => {
            if (value < 30) {
               throw Error("User too young.")
            }
         }
      }),
      verified: boolean(),
      company: fields({ instanceOf: Company })
    })
)(function() {});

const Company = compose(
   withFields({
      name: string()
   })
)(function() {});

const user = new User();
user.populate({
   email: "user3@email.com",
   previousEmails: ["user2@email.com", "user1@email.com"],
   age: 25,
   verified: true,
   company: {
      name: "Awesome Company"   
   }
});

// Throws an error with message "User too young".
async user.validate();
```

## Reference

##### `withFields(fields : { [string] : FieldFactory }): WithFieldsFunction`
Creates a new function, whose instances contain defined fields and are decorated with `populate` and `validate` methods.

### `WithFieldsFunction`

Except fields, instances of `WithFieldsFunction` are decorated with a couple of useful methods.

##### `populate(data: Object): void`
Calls a hook or in other words, executes all registered hook callbacks.

##### `registerHookCallback(name: string, callback: Function)`
Registers a callback for given hook. Useful when registering hooks inside of custom methods.
