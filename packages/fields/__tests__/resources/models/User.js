import { withFields, string, number, boolean, onGet } from "@commodo/fields";
import { withName } from "@commodo/name";
import { compose } from "ramda";

const User = compose(
    withFields({
        firstName: string(),
        lastName: string(),
        age: number(),
        enabled: boolean(),
        totalSomething: onGet(() => 555)(number({ readOnly: true }))
    }),
    withName("User")
)(function() {});

export default User;
