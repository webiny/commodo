import { withFields, string } from "@commodo/fields";
import { withPrimaryKey } from "@commodo/fields-storage";
import { withHooks } from "@commodo/hooks";
import mdbid from "mdbid";

export const isId = value => {
    if (typeof value === "string") {
        return value.match(new RegExp("^[0-9a-fA-F]{24}$")) !== null;
    }

    return false;
};

export default () => Model => {
    withFields({
        id: string({
            validation: value => {
                if (value && !isId(value)) {
                    throw new Error(
                        `A valid Mongo ID must be assigned to the "id" field (tried to assign ${value}).`
                    );
                }
            }
        })
    })(Model);

    withPrimaryKey("id")(Model);
    withHooks({
        beforeCreate() {
            if (!this.id) {
                this.id = mdbid();
            }
        }
    })(Model);

    return Model;
};
