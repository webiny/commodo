import { withFields, string } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import createModel from "./createModel";

const Group = compose(
    withFields({
        name: string()
    }),
    withName("Group")
)(createModel());

const UsersGroups = compose(
    withFields(() => ({
        user: ref({ instanceOf: User }),
        group: ref({ instanceOf: Group })
    })),
    withName("UsersGroups")
)(createModel());

const User = compose(
    withFields({
        name: string(),
        groups: ref({ instanceOf: Group, list: true, using: UsersGroups })
    }),
    withName("User")
)(createModel());

export { User, Group, UsersGroups };
