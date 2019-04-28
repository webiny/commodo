# @commodo/hooks
Hooks are points in code on which you can hook on to and execute one or more callbacks. 

This is where the `withHooks` higher order function comes in. It creates a new function, decorated with methods for defining custom hooks and registration of hook callbacks.

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

A good example where hooks are efficiently utilized is the [withStorage](../fields-storage) higher order function, which once applied, registers a set of hooks like `beforeCreate`, `afterCreate`, `beforeUpdate` and so on. Check the documention there for more information.


## Reference

##### `withHooks(callbacks: ?{[string]: Function}): WithHooksFunction`
Creates a new function with callbacks to hooks passed to its instances. 
`callbacks` argument is an object that contains name of the hook as key, and callback as value.

### `WithHooksFunction`

Instances of `WithHooksFunction` are decorated with `hook` and `registerHookCallback` methods.

##### `hook(name: string): Promise<void>`
Calls a hook or in other words, executes all registered hook callbacks.

##### `registerHookCallback(name: string, callback: Function)`
Registers a callback for given hook. Useful when registering hooks inside of custom methods.
