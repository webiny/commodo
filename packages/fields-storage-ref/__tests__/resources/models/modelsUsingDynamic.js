import { withFields, string } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import { withProps } from "repropose";
import createModel from "./createModel";

const GroupDynamic = compose(
    withFields({
        name: string()
    }),
    withName("GroupDynamic")
)(createModel());

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
)(createModel());

const UserDynamicGroupsDynamic = compose(
    withFields({
        userDynamic: ref({ instanceOf: UserDynamic }),
        groupDynamic: ref({ instanceOf: GroupDynamic })
    }),
    withName("UserDynamicGroupsDynamic")
)(createModel());

export { UserDynamic, GroupDynamic, UserDynamicGroupsDynamic };
