// @flow
import type { FieldFactory } from "@commodo/fields/types";
import withFieldDataTypeValidation from "./withFieldDataTypeValidation";
import { compose } from "ramda";
import createField from "./createField";

const boolean: FieldFactory = ({ list, ...rest } = {}) => {
    return compose(
        withFieldDataTypeValidation(value => {
            return typeof value === "boolean";
        })
    )(createField({ ...rest, list, type: "boolean" }));
};

export default boolean;
