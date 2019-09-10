import { withStorage } from "@commodo/fields-storage";
import { compose } from "ramda";
import { CustomDriver, withId } from "./../CustomDriver";

const createModel = () =>
    compose(
        withId(),
        withStorage({
            driver: new CustomDriver()
        })
    )();

export default createModel;
