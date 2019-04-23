import { withFields, string, number, boolean } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import Model from "./Model";

const Group = compose(
    withFields({
        name: string()
    }),
    withName("Group")
)(Model);

const UsersGroups = compose(
    withFields(() => ({
        user: ref({ instanceOf: User }),
        group: ref({ instanceOf: Group })
    })),
    withName("UsersGroups")
)(Model);

const User = compose(
    withFields({
        name: string(),
        groups: ref({ instanceOf: Group, list: true, using: UsersGroups })
    }),
    withName("User")
)(Model);

export { User, Group, UsersGroups };
