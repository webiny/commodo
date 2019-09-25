// @flow
import type { FieldFactory } from "@commodo/fields/types";
import WithFieldsError from "./../WithFieldsError";
import { withProps } from "repropose";
import { hasFields } from "@commodo/fields";
import withFieldDataTypeValidation from "./withFieldDataTypeValidation";
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

const fields: FieldFactory = ({ list, instanceOf, ...rest }: Object) => {
    if (!instanceOf) {
        throw new WithFieldsError(
            `When defining a "fields" field, "instanceOf" argument must be set.`,
            WithFieldsError.MODEL_FIELD_INSTANCEOF_NOT_SET
        );
    }

    const field = createField({ ...rest, list, type: "fields" });
    withProps(instance => {
        const { setValue, validate, isDirty, clean } = instance;

        return {
            instanceOf,
            isDirty() {
                if (isDirty.call(this)) {
                    return true;
                }

                if (instance.current === null) {
                    return false;
                }

                if (instance.list) {
                    for (let i = 0; i < instance.current.length; i++) {
                        let currentElement = instance.current[i];
                        if (currentElement.isDirty()) {
                            return true;
                        }
                    }
                    return false;
                }

                return hasFields(instance.current) && instance.current.isDirty();
            },
            clean() {
                clean.call(this);
                if (instance.current === null) {
                    return this;
                }

                if (instance.list) {
                    for (let i = 0; i < instance.current.length; i++) {
                        let currentElement = instance.current[i];
                        if (currentElement.isDirty()) {
                            currentElement.clean();
                        }
                    }
                    return this;
                }

                if (instance.current.isDirty()) {
                    instance.current.clean();
                }

                return this;
            },
            setValue(value) {
                if (value === null) {
                    return setValue.call(this, null);
                }

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

                if (this.current === null) {
                    return;
                }

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
    })(field);

    withFieldDataTypeValidation(value => {
        if (typeof value === "object") {
            if (hasFields(value)) {
                return value instanceof instanceOf;
            }
            return true;
        }
        return false;
    })(field);

    return field;
};

export default fields;
