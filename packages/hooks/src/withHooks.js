// @flow
import { compose } from "ramda";
import { withProps } from "repropose";

const withHooks = (hooks: ?{ [string]: Function }) => {
    return compose(
        withProps(props => {
            if (hooks) {
                Object.keys(hooks).forEach((name: string) => {
                    hooks && hooks[name] && props.onHook(name, hooks[name]);
                });
            }
            return {};
        }),
        withProps(props => {
            if (props.__hooks) {
                return {};
            }

            return {
                __hooks: {},
                onHook(name, cb) {
                    if (!this.__hooks[name]) {
                        this.__hooks[name] = [];
                    }

                    this.__hooks[name].push(cb);
                },
                async hook(...args) {
                    const [name, ...rest] = args;
                    if (Array.isArray(this.__hooks[name])) {
                        for (let i = 0; i < this.__hooks[name].length; i++) {
                            await this.__hooks[name][i].apply(this, rest);
                        }
                    }
                }
            };
        })
    );
};

export default withHooks;
