// @flow
import { withProps } from "repropose";

const onGet = (callback: (value: any) => any) => {
    return withProps(props => {
        const { getValue } = props;
        return {
            getValue() {
                return callback(getValue.call(this));
            }
        };
    });
};

export default onGet;
