// @flow
import { withProps } from "repropose";

function isPromise(value) {
    return Boolean(value && typeof value.then === "function");
}

const onSet = (callback: (value: any) => any) => {
    return withProps(props => {
        const { setValue } = props;
        return {
            setValue(value) {
                const newValue = callback(value);
                if (isPromise(newValue)) {
                    throw new Error(
                        `A promise was returned from the "onSet" callback (applied on the "${props.name}" field). Provided callbacks cannot perform async operations.`
                    );
                }
                return setValue.call(this, newValue);
            }
        };
    });
};

export default onSet;
