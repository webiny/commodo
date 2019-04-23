// @flow
import { withProps } from "repropose";

const setOnce = () => {
    return withProps(props => {
        const { setValue } = props;
        return {
            valueSet: false,
            setValue(value) {
                if (this.valueSet) {
                    return;
                }

                this.valueSet = true;
                return setValue.call(this, value);
            }
        };
    });
};

export default setOnce;
