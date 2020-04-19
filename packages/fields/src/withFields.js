import { withProps, withStaticProps } from "repropose";
import { WithFieldsError } from "@commodo/fields";

const withFields = (fields: Object) => {
    return baseFn => {
        let fn = withProps(props => {
            if (props.__withFields) {
                return {};
            }

            return {
                __withFields: {
                    fields: {},
                    processing: { validation: false, dirty: false }
                },

                getFields() {
                    return this.__withFields.fields;
                },
                getField(name) {
                    return this.__withFields.fields[name];
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
                    if (this.__withFields.processing.validation) {
                        return;
                    }
                    this.__withFields.processing.validation = true;

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

                    this.__withFields.processing.validation = false;

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
                    if (this.__withFields.processing.dirty) {
                        return false;
                    }

                    this.__withFields.processing.dirty = true;

                    const fields = this.getFields();
                    for (let valueKey in fields) {
                        const field = fields[valueKey];
                        if (field && field.isDirty()) {
                            this.__withFields.processing.dirty = false;
                            return true;
                        }
                    }

                    this.__withFields.processing.dirty = false;
                    return false;
                }
            };
        })(baseFn);

        fn = withProps(instance => {
            let fieldsList = fields;
            if (typeof fields === "function") {
                fieldsList = fields(instance);
            }

            for (let newFieldName in fieldsList) {
                const valueFactory = fieldsList[newFieldName];
                instance.__withFields.fields[newFieldName] = new valueFactory(
                    newFieldName,
                    instance
                );

                Object.defineProperty(instance, newFieldName, {
                    get() {
                        if (this.__withFields.fields[newFieldName].get) {
                            return this.__withFields.fields[newFieldName].get.call(
                                this,
                                this.__withFields.fields[newFieldName]
                            );
                        }
                        return this.__withFields.fields[newFieldName].getValue();
                    },
                    set(value) {
                        if (this.__withFields.fields[newFieldName].set) {
                            this.__withFields.fields[newFieldName].set.call(
                                this,
                                this.__withFields.fields[newFieldName],
                                value
                            );
                        } else {
                            this.__withFields.fields[newFieldName].setValue(value);
                        }
                    }
                });
            }

            return {};
        })(fn);

        fn = withStaticProps({
            __withFields: true // For satisfying hasFields helper function.
        })(fn);

        return fn;
    };
};

export default withFields;
