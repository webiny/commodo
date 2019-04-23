// @flow
import { withProps } from "repropose";
import type { FieldValue } from "@commodo/fields/types";
import { WithFieldsError } from "@commodo/fields";

const throwDataTypeError = (fieldType, fieldName, value) => {
    throw new WithFieldsError(
        `Invalid data type: ${fieldType} field "${fieldName}" cannot accept value ${value}.`,
        WithFieldsError.FIELD_DATA_TYPE_ERROR
    );
};

const validateValue = ({
    value,
    validate,
    name,
    type
}: {
    value: mixed,
    validate: Function,
    name: string,
    type: string
}) => {
    if (value !== undefined && value !== null) {
        if (!validate(value, this)) {
            throwDataTypeError(type, name, value);
        }
    }
};

const withFieldDataTypeValidation = (validate: (value: FieldValue, field: Object) => boolean) => {
    return withProps(props => {
        const { setValue } = props;

        return {
            setValue(value, ...args) {
                if (value === null) {
                    return setValue.call(this, value, ...args);
                }
                
                const { list, type, name } = this;
                if (list) {
                    if (!Array.isArray(value)) {
                        throwDataTypeError(`${type} (list)`, name, `${value} (non-list)`);
                    }

                    value.forEach(item => validateValue({ value: item, validate, name, type }));
                } else {
                    validateValue({ value, validate, name, type });
                }

                return setValue.call(this, value, ...args);
            }
        };
    });
};

export default withFieldDataTypeValidation;
