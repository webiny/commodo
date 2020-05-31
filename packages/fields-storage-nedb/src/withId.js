import { withFields } from "@commodo/fields";
import { id } from "@commodo/fields-storage-nedb/fields";

export default () => {
    return withFields({
        id: id()
    });
};
