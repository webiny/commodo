import { withStorage } from "@commodo/fields-storage";
import { compose } from "ramda";
import { CustomDriver, withId } from "./../CustomDriver";

const Model = compose(
    withId(),
    withStorage({
        driver: new CustomDriver()
    })
)(function() {});

export default Model;
