// @flow
import type { FieldFactory } from "@commodo/fields/types";
import WithFieldsError from "./../WithFieldsError";
import { withProps } from "repropose";
import { hasFields } from "@commodo/fields";
import withFieldDataTypeValidation from "./withFieldDataTypeValidation";
import { compose } from "ramda";
import createField from "./createField";

const prepareValue = ({ value, instanceOf }) => {
    let newValue = null;
    if (value) {
        if (hasFields(value)) {
            newValue = value;
        } else {
            newValue = new instanceOf();
            if (typeof newValue.populate === "function") {
                newValue.populate(value);
            } else {
                throw new WithFieldsError(
                    `Cannot populate model "${instanceOf}" - "populate" method missing. Forgot to use "withFields"?`,
                    WithFieldsError.MODEL_POPULATE_MISSING
                );
            }
        }
    }

    return newValue;
};

const object: FieldFactory = ({ list, instanceOf, ...rest }: Object) => {
    if (!instanceOf) {
        throw new WithFieldsError(
            `When defining a "object" field, "instanceOf" argument must be set.`,
            WithFieldsError.MODEL_FIELD_INSTANCEOF_NOT_SET
        );
    }

    return compose(
        withFieldDataTypeValidation(value => {
            if (typeof value === "object") {
                if (hasFields(value)) {
                    return value instanceof instanceOf;
                }
                return true;
            }
            return false;
        }),
        withProps(props => {
            const { setValue, validate } = props;

            return {
                setValue(value) {
                    if (this.list) {
                        const preparedValues = [];
                        value.forEach(item =>
                            preparedValues.push(prepareValue({ value: item, instanceOf }))
                        );
                        return setValue.call(this, preparedValues);
                    }
                    const preparedValue = prepareValue({ value, instanceOf });
                    return setValue.call(this, preparedValue);
                },
                async validate() {
                    await validate.call(this);
                    if (this.list) {
                        for (let i = 0; i < this.current.length; i++) {
                            const current = this.current[i];
                            current && (await current.validate());
                        }
                        return;
                    }

                    this.current && (await this.current.validate());
                }
            };
        })
    )(createField({ ...rest, list, type: "object" }));
};

export default object;
