import { withFields, string } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import { withProps } from "repropose";
import Model from "./Model";

const GroupDynamic = compose(
    withFields({
        name: string()
    }),
    withName("GroupDynamic")
)(Model);

const UserDynamic = compose(
    withProps({
        get groupsDynamic() {
            return [new GroupDynamic(), new GroupDynamic()];
        }
    }),
    withFields(() => ({
        name: string()
    })),
    withName("UserDynamic")
)(Model);

const UserDynamicGroupsDynamic = compose(
    withFields({
        userDynamic: ref({ instanceOf: UserDynamic }),
        groupDynamic: ref({ instanceOf: GroupDynamic })
    }),
    withName("UserDynamicGroupsDynamic")
)(Model);

export { UserDynamic, GroupDynamic, UserDynamicGroupsDynamic };
