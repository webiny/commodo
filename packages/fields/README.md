# @commodo/fields [![](https://img.shields.io/npm/v/@commodo/fields.svg)](https://www.npmjs.com/package/@commodo/fields)

Enables defining rich data models by decorating function instances with specified model fields. Additionally, it adds `populate` and `validate` methods, for populating model instances with data, and then validating it, respectively.

## Usage
```js
import { withFields, string, number, boolean, fields } from "@commodo/fields";
import { compose } from "ramda";

// User function (data model).
const User = compose(
   withFields({
      // A field which accepts string values.
      email: string(),
      
      // Set "list" to true in order to store a list of string values.
      previousEmails: string({ list: true }), 
     
      // A field which accepts boolean values. 
      verified: boolean(),
    
      // A field that consists of nested fields. It can accept an instance of Company data model,
      // or a plain object, from which a new Company instance will be created upon value assignment. 
      company: fields({ instanceOf: Company }), 

      // A field which accepts number values. Additionally, with the passed "validation" callback, 
      // we are ensuring that the assigned value is greater than or equal to 30.
      age: number({
         validation: value => {
            if (value < 30) {
               throw Error("User too young.")
            }
         }
      })
    })
)();

// Company function (data model).
const Company = compose(
   withFields({
      name: string()
   })
)();

// Let's create an instance of the User data model, and populate it with some data.
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

// Using the "validate" method, we can check if the assigned values are valid. 
// This will throws an error with the "User too young" message.
async user.validate();
```

## Available fields

Out of the box, there are four types of fields you can utilize:
1. `string` - accepts string values
2. `number` - accepts number values
3. `boolean` - accepts boolean values
4. `fields` - accepts a plain object or an instance of another `withFields` function

In the following examples, all types of fields are utilized:
```js
// Company function (data model).
const Company = compose(
   withFields({
      name: string()
   })
)();

const User = compose(
   withFields({
      email: string(),
      age: number(),
      verified: boolean(),
      company: fields({ instanceOf: Company })
    })
)();
```

## Data validation

### Data-type validation
When a value is assigned to a field of a model instance, it is immediately validated on a data-type level, meaning you cannot pass a string value to a field that doesn't accept strings.

Consider the following example:

```js
import { withFields, string, number } from "@commodo/fields";

const User = withFields({
  name: string(),
  age: number(),
})();

const user = new User();

// Will throw data type error, because we cannot populate the "age" field with a string
// value. Since the field accepts only numbers, the age must be an integer or a float.
user.age = "7";

// The same will happen here.
user.populate({ name: "Rex", age: "7", drools: false });
```

Data-type validation is always executed upon value assignment, synchronously.

### Custom validation
Additionally, you can also add your own custom, business logic related, validation. Unlike the data-type validation, which happens immediately upon assigning the value to a field, the custom validation is triggered by calling the `validate` method. Note that this method validates the whole model instance.

The following snippet shows how we can add your own custom validation and trigger it:

```js
import { withFields, string, number } from "@commodo/fields";

const User = withFields({
  name: string({
    validate: value => {
      if (!value) {
        throw new Error("Name is required.");
      }
    }
  }),
  age: number({
    validate: value => {
      if (value && value < 2) {
        throw new Error("Your dog is to young.");
      }
    }
  })
})();

const user = new User();

// Will throw an error, since the dog is too young.
user.populate({ name: "Rex", age: 1 });
await user.validate();

// The age is now correct, but now the name is missing.
user.populate({ age: 2 });
await user.validate();
```
Unlike the data-type validation, custom validation can perform asynchronous operations.

## Field options
Each field can accept a few options:
#### `list: boolean`
If set to `true`, field will accept an `null` or an array of values. When setting field value, if a single item in the passed array is of incorrect data type, an error will be thrown.

#### `validation: Function`
A function for validating the assigned value. Not for data-type validation (since it's already done upon assigning a value), but for checking if the value complies with custom logic, for example if the assigned value is greater than 20.

#### `value: any`

## Additional higher order functions
Except options, fields can also be enhanced with a couple of provided higher order functions:

#### `onGet: Function => Function`

#### `onSet: Function => Function`

#### `skipOnPopulate: Function => Function`

#### `setOnce: Function => Function`

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
