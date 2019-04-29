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
1. `string` - accepts `null` and string values
2. `number` - accepts `null` and number values
3. `boolean` - accepts `null` and boolean values
4. `fields` - accepts `null`, a plain object or an instance of another `withFields` function

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

Note that if the data type of a value is different than field type, an error will immediately be thrown:
```
const User = compose(
   withFields({
      email: string()    
   })
)(function() {});

const user = new User();

// Throws a WithFieldsError (code: "FIELD_DATA_TYPE_ERROR"):
user.email = true;
```

Each field can accept a few options:
#### list: boolean
If set to `true`, field will accep
#### readOnly: boolean
#### validation: Function
#### value: any

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
