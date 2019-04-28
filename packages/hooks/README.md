# @commodo/hooks

Use `withHooks` higher order function to define custom hooks - points in code on which you can hook on to, and execute one or more snyc or async callbacks.

## Example
In the following example, an "emailSent" hook is defined in the `sendEmail` method. And upon applying `withHooks`, a callback to it is defined.

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
            await this.triggerHook("emailSent")
            
            return true;
        }
    })
)(function() {});

const Company = compose(
  withName("Company"),
  ...
)(function() {});
```

A good example where hooks are utilized is the [withStorage](./../storage) higher order function, which once applied, registers a set of hooks like `beforeCreate`, `afterCreate`, `beforeUpdate` and so on.

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
            await this.triggerHook("emailSent")
            
            return true;
        }
    })
)(function() {});

const Company = compose(
  withName("Company"),
  ...
)(function() {});
```
