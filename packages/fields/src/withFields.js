import { withProps, withStaticProps } from "repropose";
import { WithFieldsError } from "@commodo/fields";
import { compose } from "ramda";

const withFields = (fields: Object) => {
    return compose(
        withStaticProps({
            __withFields: true // For satisfying hasFields helper function.
        }),
        withProps(instance => {
            const newFields = { __withFields: { ...instance.__withFields } };

            let list = fields;
            if (typeof fields === "function") {
                list = fields(instance);
            }

            for (let newFieldName in list) {
                const valueFactory = list[newFieldName];
                newFields.__withFields[newFieldName] = new valueFactory();

                Object.defineProperty(newFields, newFieldName, {
                    get() {
                        return this.__withFields[newFieldName].getValue();
                    },
                    set(value) {
                        this.__withFields[newFieldName].setValue(value);
                    }
                });

                newFields.__withFields[newFieldName].name = newFieldName;
                newFields.__withFields[newFieldName].parent = instance;
                if (typeof newFields.__withFields[newFieldName].init === "function") {
                    newFields.__withFields[newFieldName].init();
                }
            }

            return newFields;
        }),
        withProps(props => {
            if (props.__withFields) {
                return {};
            }

            return {
                __withFields: {},
                processing: { validation: false, dirty: false },
                getFields() {
                    return this.__withFields;
                },
                getField(name) {
                    return this.__withFields[name];
                },
                populate(data) {
                    if (data && typeof data === "object") {
                        const values = this.getFields();
                        for (let valueKey in values) {
                            const value = values[valueKey];
                            if (!value || value.skipOnPopulate || !(valueKey in data)) {
                                continue;
                            }

                            values[valueKey].setValue(data[valueKey]);
                        }
                    }

                    return this;
                },

                async validate() {
                    if (this.processing.validation) {
                        return;
                    }
                    this.processing.validation = true;

                    const invalidFields = {};
                    const fields = this.getFields();

                    for (let name in fields) {
                        const field = fields[name];
                        try {
                            await field.validate();
                        } catch (e) {
                            invalidFields[name] = {
                                code: e.code || WithFieldsError.VALIDATION_FAILED_INVALID_FIELD,
                                data: e.data || null,
                                message: e.message
                            };
                        }
                    }

                    this.processing.validation = false;

                    if (Object.keys(invalidFields).length > 0) {
                        throw new WithFieldsError(
                            "Validation failed.",
                            WithFieldsError.VALIDATION_FAILED_INVALID_FIELDS,
                            {
                                invalidFields
                            }
                        );
                    }
                },

                clean(): void {
                    const values = this.getFields();
                    for (let valueKey in values) {
                        const value = values[valueKey];
                        value && value.isDirty() && value.clean();
                    }
                },

                isDirty(): boolean {
                    if (this.processing.dirty) {
                        return false;
                    }

                    this.processing.dirty = true;

                    const fields = this.getFields();
                    for (let valueKey in fields) {
                        const field = fields[valueKey];
                        if (field && field.isDirty()) {
                            this.processing.dirty = false;
                            return true;
                        }
                    }

                    this.processing.dirty = false;
                    return false;
                }
            };
        })
    );
};

export default withFields;
