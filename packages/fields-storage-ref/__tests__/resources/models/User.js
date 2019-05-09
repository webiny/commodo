import { withFields, string, number, boolean } from "@commodo/fields";
import { withName } from "@commodo/name";
import { compose } from "ramda";
import Model from "./Model";
import { withProps } from "repropose";

const User = compose(
    withFields({
        firstName: string(),
        lastName: string(),
        age: number(),
        enabled: boolean()
    }),
    withProps({
        get totalSomething() {
            return 555;
        }
    }),
    withName("User")
)(Model);

export default User;
