// @flow
import type { FieldFactory } from "@commodo/fields/types";
import withFieldDataTypeValidation from "./withFieldDataTypeValidation";
import createField from "./createField";

const string: FieldFactory = ({ list, ...rest } = {}) => {
    let field = createField({ ...rest, list, type: "string" });
    withFieldDataTypeValidation(value => {
        return typeof value === "string";
    })(field);

    return field;
};

export default string;
