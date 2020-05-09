// @flow
import { withProps } from "repropose";

const setOnce = () => {
    return withProps(props => {
        const { setValue } = props;
        return {
            setValue(value) {
                if (this.state.set) {
                    return;
                }

                return setValue.call(this, value);
            }
        };
    });
};

export default setOnce;
