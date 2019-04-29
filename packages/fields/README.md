# @commodo/fields
Creates a new function, whose instances are decorated with defined fields and a couple of useful methods (more information in the following sections).

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

## Fields

There are four types of fields you can define:
1. `string` - accepts string values
2. `number` - accepts number values
3. `boolean` - accepts boolean values
4. `fields` - accepts an object or an instance of another `withFields` function

In the following examples, all types of fields are utilized:
```
const User = compose(
   withFields({
      email: string(),
      age: number(),
      verified: boolean(),
      company: fields({ instanceOf: Company })
    })
)(function() {});
```


## Reference

#### `withFields(fields : { [string] : FieldFactory }): WithFieldsFunction`
Creates a new function, whose instances contain defined fields and are decorated with a couple of useful methods.

### FieldFactory


### `WithFieldsFunction`

Except fields, instances of `WithFieldsFunction` are decorated with a couple of useful methods.

#### `populate(data: Object): void`
Populates fields with given data.

#### `validate(): Promise<void>`
Validates all fields.

#### `getFields(): Array<Field>`
Returns all fields.

#### `getField(name: string): ?Field`
Returns a single field.

#### `clean(): void`
Sets instance as clean.

#### `isDirty(): boolean`
Checks if instance is dirty.
