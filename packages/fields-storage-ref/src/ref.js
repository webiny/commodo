// @flow
import type { FieldFactory } from "@commodo/fields/types";
import { withRefProps } from "./functions";
import { hasFields, createField, withFieldDataTypeValidation } from "@commodo/fields";
import { instanceOf as isInstanceOf, validateArguments } from "./functions";

const ref: FieldFactory = (params: Object) => {
    validateArguments(params);

    const field = createField({ ...params, type: "ref" });
    withRefProps(params)(field);
    withFieldDataTypeValidation(value => {
        const typeOf = typeof value;
        if (typeOf === "string") {
            return true;
        }

        if (typeOf === "object") {
            if (hasFields(value)) {
                return isInstanceOf(value, params.instanceOf);
            }
            return true;
        }
        return false;
    })(field);

    return field;
};

export default ref;
