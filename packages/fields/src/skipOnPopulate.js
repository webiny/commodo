// @flow
import { withProps } from "repropose";

const skipOnPopulate = () => {
    return withProps({
        skipOnPopulate: true
    });
};

export default skipOnPopulate;
