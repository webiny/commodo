import { withProps } from "repropose";

const executeHookCallbacks = async (callbacks, args, instance) => {
    for (let i = 0; i < callbacks.length; i++) {
        await callbacks[i].apply(instance, args);
    }
};

const withHooks = (hooks: { [string]: Function }) => {
    return baseFn => {
        let fn = withProps(props => {
            if (props.__withHooks) {
                return {};
            }

            return {
                __withHooks: {},
                __registerHookCallback(name, cb) {
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
                registerHookCallback(...args) {
                    // eslint-disable-next-line
                    console.warn(
                        `DEPRECATION WARNING: this will be removed in next major release, use "this.hook" instead, where 2nd argument is a callback.`
                    );
                    return this.__registerHookCallback(...args);
                },
                hook(...args) {
                    const [name, ...rest] = args;

                    // If first argument is a function, that means we are registering a new hook callback.
                    if (typeof rest[0] === "function") {
                        return this.__registerHookCallback(name, rest[0]);
                    } else {
                        // Otherwise, we are just triggering a hook.
                        if (Array.isArray(this.__withHooks[name])) {
                            // This step is important because callbacks can remove themselves from the array of callbacks,
                            // thus creating errors while looping over them. That's why we first reassign all callbacks
                            // into a new array.
                            const callbacks = [...this.__withHooks[name]];
                            return executeHookCallbacks(callbacks, rest, this);
                        }
                    }
                }
            };
        })(baseFn);

        fn = withProps(props => {
            if (hooks) {
                Object.keys(hooks).forEach((name: string) => {
                    hooks && hooks[name] && props.__registerHookCallback(name, hooks[name]);
                });
            }
            return {};
        })(fn);

        return fn;
    };
};

export default withHooks;
