import { withFields, string, number, boolean } from "@commodo/fields";
import { withName } from "@commodo/name";
import { compose } from "ramda";
import { withProps } from "repropose";
import Model from "./Model";

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
