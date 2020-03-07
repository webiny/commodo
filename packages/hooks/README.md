# @commodo/hooks [![](https://img.shields.io/npm/v/@commodo/hooks.svg)](https://www.npmjs.com/package/@commodo/hooks)

Hooks are points in code on which you can "hook" on to and execute one or more callbacks. 

This is where the `withHooks` higher order function comes in. It decorates a function with a simple method for defining custom hooks and registration of hook callbacks.

A good example where hooks are efficiently utilized is the [withStorage](../fields-storage) higher order function. Once applied, it registers a set of hooks like `beforeCreate`, `afterCreate`, `beforeUpdate`, `afterUpdate`, and so on. Please check the package documentation for more details.

## Usage
In the following example, an `emailSent` hook is defined in the `sendEmail` method. Note that the `await` keyword is prepended, since registered hook callbacks can contain async code. But this is not a requirement - in some cases making a call without the `await` keyword could also suffice.

After `withProps`, we utilize the `withHooks` higher order function, where we register the `emailSent` hook callback.

```js
import { withHooks } from "@commodo/hooks";
import { compose } from "ramda";
import { withProps } from "repropose";

const User = compose(
    withProps({
        email: "some-assigned@email.com",
        async sendEmail() {
            (...)
            
            // Trigger "emailSent" hook.
            // Since registered callbacks can contain async code, we use await keyword.
            await this.hook("emailSent")
            
            return true;
        }
    }),
   withHooks({
        emailSent()  {
            console.log("E-mail was sent!");
            
            // You can use "this" keyword to access other properties in the function instance!
            // Note that this won't work if you've defined the hook callback using arrow function.
            console.log("E-mail address: " + this.email);
        }
    })
)();

const user = new User();

// This will do whatever was stated in the method, and also log "E-mail was sent!" 
// message because of the hook callback we've registered inside of the `withHooks` call.
await user.sendEmail();
```
Note: for more information about the `withProps` higher order function, please check the docs of the [repropose](https://github.com/doitadrian/repropose) package.

## Reference

#### `withHooks(callbacks: {[string]: Function}): WithHooksFunction`
Decorates a function with methods for defining hooks and registering hook callbacks. 
Optionally, one or more hook callbacks can be directly passed as the first argument - an object that contains names of the hooks as keys, and callbacks as values.

### `WithHooksFunction`

Instances of `WithHooksFunction` are decorated with the `hook` method, which enables both hook registration and execution of hook callbacks. 

#### `hook(name: string, callback: Function)`
If the second argument is a function, the `hook` method assumes a new hook callback is being registered.

#### `hook(name: string, ...args): Promise<void>`
If there is no second argument, or the argument is not a function, the `hook` method assumes it needs to execute all hook callbacks. Note that the method can take unlimited amount of arguments, which will all be forwarded to the hook callback.
