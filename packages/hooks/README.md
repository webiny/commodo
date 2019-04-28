# @commodo/hooks
Hooks are points in code on which you can hook on to and execute one or more snyc or async callbacks. 

This is where the `withHooks` higher order function comes in. It creates a new function, decorated with methods for defining hooks and registration of callbacks.

## Example
In the following example, in the `sendEmail` method, an "emailSent" hook is defined. Note that the `await` keyword is prepended, since registered hook callbacks can contain async code. But this is not a requirement -  some use cases might not need to wait for all of the registered callbacks to resolve.

```js
import { withHooks } from "@commodo/hooks";
import { compose } from "ramda";
import { withProps } from "repropose";

const User = compose(
    withHooks({
        emailSent: () => {
            // Do the necessary actions.
        }
    }),
    withProps({
        async sendEmail() {
            (...)
            
            // Trigger "emailSent" hook.
            // Since registered callbacks can contain async code, we use await keyword.
            await this.hook("emailSent")
            
            return true;
        }
    })
)(function() {});

const Company = compose(
  withName("Company"),
  ...
)(function() {});
```

A good example where hooks are also utilized is the [withStorage](../fields-storage) higher order function, which once applied, registers a set of hooks like `beforeCreate`, `afterCreate`, `beforeUpdate` and so on. Check the documention there for more information.


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
