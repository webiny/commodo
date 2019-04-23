// @flow
import { withProps } from "repropose";

const onSet = (callback: (value: any) => any) => {
    return withProps(props => {
        const { setValue } = props;
        return {
            setValue(value) {
                return setValue.call(this, callback(value));
            }
        };
    });
};

export default onSet;
