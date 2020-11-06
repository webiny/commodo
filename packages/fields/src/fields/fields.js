import type { FieldFactory } from "@commodo/fields/types";
import WithFieldsError from "./../WithFieldsError";
import { withProps } from "repropose";
import { hasFields } from "@commodo/fields";
import { getName, hasName } from "@commodo/name";
import withFieldDataTypeValidation from "./withFieldDataTypeValidation";
import createField from "./createField";

const prepareValue = ({ value, instanceOf, instanceOfModels, instanceOfModelField }) => {
    if (!value) {
        return null;
    }

    let returnValue;

    if (hasFields(value)) {
        // We already know the value is a valid model instance (see "withFieldDataTypeValidation" below).
        returnValue = value;
        if (instanceOfModelField) {
            returnValue[instanceOfModelField] = getName(returnValue);
        }
    } else {
        let Model = instanceOf;
        if (instanceOfModels) {
            const instanceOfModelFieldValue = value[instanceOfModelField];
            if (!instanceOfModelFieldValue) {
                throw new WithFieldsError(
                    `Cannot set value to a "fields" field - the "${instanceOfModelField}" property of the received plain object is missing.`,
                    WithFieldsError.RECEIVED_DATA_OBJECT_TYPE_VALUE_IS_MISSING
                );
            }

            Model = instanceOfModels.find(Model => {
                return getName(Model) === instanceOfModelFieldValue;
            });

            if (!Model) {
                throw new WithFieldsError(
                    `Cannot set value to a "fields" field - the "${instanceOfModelField}" property of the received plain object contains an invalid value ${instanceOfModelFieldValue}.`,
                    WithFieldsError.RECEIVED_DATA_OBJECT_CONTAINS_INVALID_TYPE_VALUE
                );
            }
        }

        returnValue = new Model();

        if (typeof returnValue.populate === "function") {
            returnValue.populate(value);
        } else {
            throw new WithFieldsError(
                `Cannot populate model "${instanceOf}" - "populate" method missing. Forgot to use "withFields"?`,
                WithFieldsError.MODEL_POPULATE_MISSING
            );
        }

        if (instanceOfModelField) {
            returnValue[instanceOfModelField] = getName(returnValue);
        }
    }

    // We did already assign a value to the "instanceOfModelField" field on the "returnValue" model instance above.
    // But, was that really a field that was defined on the model instance? Let's just try to get the field, and
    // ensure that was really a field that we were assigning a value to.
    if (instanceOfModelField) {
        if (!returnValue.getField(instanceOfModelField)) {
            throw new WithFieldsError(
                `Cannot set value to a "fields" field - the "${getName(
                    returnValue
                )}" should contain the "${instanceOfModelField}" string field, but it does not.`,
                WithFieldsError.DATA_MODEL_MODEL_TYPE_FIELD_DOES_NOT_EXIST
            );
        }
    }

    return returnValue;
};

const fields: FieldFactory = ({ list, instanceOf, ...rest }: Object) => {
    if (!instanceOf) {
        throw new WithFieldsError(
            `When defining a "fields" field, "instanceOf" argument must be set.`,
            WithFieldsError.MODEL_FIELD_INSTANCEOF_NOT_SET
        );
    }

    let instanceOfModels;
    let instanceOfModelField;
    if (Array.isArray(instanceOf)) {
        instanceOfModels = [...instanceOf];
        [instanceOfModelField] = instanceOfModels.splice(-1, 1);
        if (typeof instanceOfModelField !== "string") {
            throw new WithFieldsError(
                `Invalid "fields" field - when passing "instanceOf" as an array, the last item must be a string, marking the field name that will contain the model type.`,
                WithFieldsError.INSTANCE_OF_ARRAY_LAST_ITEM_NOT_STRING
            );
        }
    }

    const field = createField({ ...rest, list, type: "fields" });
    withProps(instance => {
        const { setValue, validate, isDirty, clean } = instance;

        return {
            instanceOf,
            instanceOfModels,
            instanceOfModelField,
            async getJSONValue() {
                if (!instance.current) {
                    return null;
                }

                if (instance.list) {
                    const output = [];
                    for (let i = 0; i < instance.current.length; i++) {
                        output.push(await instance.current[i].toJSON());
                    }
                    return output;
                }

                return instance.current.toJSON();
            },
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
                        preparedValues.push(
                            prepareValue({
                                value: item,
                                instanceOf,
                                instanceOfModels,
                                instanceOfModelField
                            })
                        )
                    );
                    return setValue.call(this, preparedValues);
                }

                const preparedValue = prepareValue({
                    value,
                    instanceOf,
                    instanceOfModels,
                    instanceOfModelField
                });
                return setValue.call(this, preparedValue);
            },
            async validate() {
                await validate.call(this);

                if (this.current === null) {
                    return;
                }

                if (this.list) {
                    const errors = [];
                    for (let i = 0; i < this.current.length; i++) {
                        const current = this.current[i];
                        try {
                            current && (await current.validate());
                        } catch (e) {
                            errors.push({
                                code: e.code,
                                data: { index: i, ...e.data },
                                message: e.message
                            });
                        }
                    }

                    if (errors.length > 0) {
                        throw new WithFieldsError(
                            "Validation failed.",
                            WithFieldsError.VALIDATION_FAILED_INVALID_FIELD,
                            errors
                        );
                    }
                    return;
                }

                this.current && (await this.current.validate());
            }
        };
    })(field);

    withFieldDataTypeValidation(value => {
        if (typeof value !== "object") {
            return false;
        }

        // If a plain object was set, just return true (the data will be used to populate a new model instance).
        if (!hasFields(value)) {
            return true;
        }

        let normalizedInstanceOf = instanceOfModels || [instanceOf];
        return Boolean(
            normalizedInstanceOf.find(Model => {
                // If both received value and instanceOf has a name attached, let's compare by it.
                if (hasName(value) && hasName(Model)) {
                    return getName(value) === getName(Model);
                }

                // Otherwise, just do a good old instanceof check.
                return value instanceof Model;
            })
        );
    })(field);

    return field;
};

export default fields;
