// @flow
import type { FieldFactory } from "@commodo/fields/types";
import withFieldDataTypeValidation from "./withFieldDataTypeValidation";
import { compose } from "ramda";
import createField from "./createField";

const string: FieldFactory = ({ list, ...rest } = {}) => {
    return compose(
        withFieldDataTypeValidation(value => {
            return typeof value === "string";
        })
    )(createField({ ...rest, list, type: "string" }));
};

export default string;
