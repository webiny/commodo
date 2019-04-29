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
#### `list: boolean`
If set to `true`, field will accept an `null` or an array of values. When setting field value, if a single item in the passed array is of incorrect data type, an error will be thrown.

#### `validation: Function`
A function for validating the assigned value. Not for data-type validation (since it's already done upon assigning a value), but for checking if the value complies with custom logic, for example if the assigned value is greater than 20.

#### `value: any`

Except options, fields can also be enhanced with a couple of provided higher order functions:

#### `onGet: Function => Function`

#### `onSet: Function => Function`

#### `skipOnPopulate: Function => Function`

#### `setOnce: Function => Function`

#### `readOnly: Function => Function`
When enabled, field will no longer accept any value. Can be paired with `onGet` higher order function, to achieve "dynamic" fields (more on this in the next section).

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
