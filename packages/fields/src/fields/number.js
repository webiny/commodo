// @flow
import type { FieldFactory } from "@commodo/fields/types";
import withFieldDataTypeValidation from "./withFieldDataTypeValidation";
import createField from "./createField";

const number: FieldFactory = ({ list, ...rest } = {}) => {
    const field = createField({ ...rest, list, type: "number" });
    withFieldDataTypeValidation(value => {
        return typeof value === "number" && value > -Infinity && value < Infinity;
    })(field);

    return field;
};

export default number;
