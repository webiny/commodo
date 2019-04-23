// @flow
import { withProps } from "repropose";

const readOnly = () => {
    return withProps(() => {
        return {
            readOnly: true,
            setValue() {}
        };
    });
};

export default readOnly;
