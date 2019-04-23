// @flow
import type { FieldFactory } from "@commodo/fields/types";
import withFieldDataTypeValidation from "./withFieldDataTypeValidation";
import { compose } from "ramda";
import createField from "./createField";

const number: FieldFactory = ({ list, ...rest } = {}) => {
    return compose(
        withFieldDataTypeValidation(value => {
            return typeof value === "number" && value > -Infinity && value < Infinity;
        })
    )(createField({ ...rest, list, type: "number" }));
};

export default number;
