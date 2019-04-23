import { withFields, string, onGet } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import Model from "./Model";

const GroupDynamic = compose(
    withFields({
        name: string()
    }),
    withName("GroupDynamic"),
)(Model);

const UserDynamic = compose(
    withFields(() => ({
        name: string(),
        groupsDynamic: onGet(() => [new GroupDynamic(), new GroupDynamic()])(
            ref({ list: true, instanceOf: GroupDynamic, using: UserDynamicGroupsDynamic, readOnly: true })
        )
    })),
    withName("UserDynamic"),
)(Model);

const UserDynamicGroupsDynamic = compose(
    withFields({
        userDynamic: ref({ instanceOf: UserDynamic }),
        groupDynamic: ref({ instanceOf: GroupDynamic })
    }),
    withName("UserDynamicGroupsDynamic"),
)(Model);

export { UserDynamic, GroupDynamic, UserDynamicGroupsDynamic };
