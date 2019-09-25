// @flow
import type { FieldFactory } from "@commodo/fields/types";
import withFieldDataTypeValidation from "./withFieldDataTypeValidation";
import createField from "./createField";

const boolean: FieldFactory = ({ list, ...rest } = {}) => {
    const field = createField({ ...rest, list, type: "boolean" });
    withFieldDataTypeValidation(value => {
        return typeof value === "boolean";
    })(field);

    return field;
};

export default boolean;
