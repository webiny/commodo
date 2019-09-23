// @flow
import { compose } from "ramda";
import { withProps } from "repropose";

const withHooks = (hooks: ?{ [string]: Function }) => {
    return compose(
        withProps(props => {
            if (hooks) {
                Object.keys(hooks).forEach((name: string) => {
                    hooks && hooks[name] && props.registerHookCallback(name, hooks[name]);
                });
            }
            return {};
        }),
        withProps(props => {
            if (props.__withHooks) {
                return {};
            }

            return {
                __withHooks: {},
                registerHookCallback(name, cb) {
                    if (!this.__withHooks[name]) {
                        this.__withHooks[name] = [];
                    }

                    this.__withHooks[name].push(cb);
                    return () => {
                        if (!this.__withHooks[name]) {
                            return;
                        }

                        const cbIndex = this.__withHooks[name].indexOf(cb);
                        if (cbIndex >= 0) {
                            this.__withHooks[name].splice(cbIndex, 1);
                            if (this.__withHooks[name].length === 0) {
                                delete this.__withHooks[name];
                            }
                        }
                    };
                },
                async hook(...args) {
                    const [name, ...rest] = args;
                    if (Array.isArray(this.__withHooks[name])) {
                        // This step is important because callbacks can remove themselves from the array of callbacks,
                        // thus creating errors while looping over them. That's why we first reassign all callbacks
                        // into a new array.
                        const callbacks = [...this.__withHooks[name]];
                        for (let i = 0; i < callbacks.length; i++) {
                            await callbacks[i].apply(this, rest);
                        }
                    }
                }
            };
        })
    );
};

export default withHooks;
