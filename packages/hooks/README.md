# @commodo/hooks
Hooks are points in code on which you can hook on to and execute one or more callbacks. 

This is where the `withHooks` higher order function comes in. It creates a new function, whose instances are decorated with methods for defining custom hooks and registration of hook callbacks.

A good example where hooks are efficiently utilized is the [withStorage](../fields-storage) higher order function. Once applied, it registers a set of hooks like `beforeCreate`, `afterCreate`, `beforeUpdate` and so on. Please check the documention of the package for more information.

## Example
In the following example, an "emailSent" hook is defined in the `sendEmail` method. Note that the `await` keyword is prepended, since registered hook callbacks can contain async code. But this is not a requirement - in some cases making a call without the `await` keyword could also suffice.

At the very end, the `withHooks` higher order function is applied, and conveniently a callback for the "emailSent" hook is provided.

```js
import { withHooks } from "@commodo/hooks";
import { compose } from "ramda";
import { withProps } from "repropose";

const User = compose(
    withProps({
        async sendEmail() {
            (...)
            
            // Trigger "emailSent" hook.
            // Since registered callbacks can contain async code, we use await keyword.
            await this.hook("emailSent")
            
            return true;
        }
    }),
   withHooks({
        emailSent: () => {
            // Do the necessary sync or async actions.
        }
    })
)(function() {});

const Company = compose(
  withName("Company"),
  ...
)(function() {});
```
Note: for more information about the `withProps` higher order function, please check the docs of the [repropose](https://github.com/doitadrian/commodo/edit/master/packages/hooks/README.md) package.

## Reference

##### `withHooks(callbacks: ?{[string]: Function}): WithHooksFunction`
Creates a new function, whose instances are decorated with methods for defining hooks and registering hook callbacks. 
Optionally, hook callbacks can immediately be passed as the first argument upon calling the `withHooks` function, an object that contains names of the hooks as keys, and callbacks as values.

### `WithHooksFunction`

Instances of `WithHooksFunction` are decorated with `hook` and `registerHookCallback` methods.

##### `hook(name: string): Promise<void>`
Calls a hook or in other words, executes all registered hook callbacks.

##### `registerHookCallback(name: string, callback: Function)`
Registers a callback for given hook. Useful when registering hooks inside of custom methods.
