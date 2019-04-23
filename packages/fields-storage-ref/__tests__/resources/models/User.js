import { withFields, string, number, boolean, onGet } from "@commodo/fields";
import { withName } from "@commodo/name";
import { compose } from "ramda";
import Model from "./Model";

const User = compose(
    withFields({
        firstName: string(),
        lastName: string(),
        age: number(),
        enabled: boolean(),
        totalSomething: onGet(() => 555)(string({ readOnly: true }))
    }),
    withName("User")
)(Model);

export default User;
