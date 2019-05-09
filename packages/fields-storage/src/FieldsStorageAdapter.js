class FieldsStorageAdapter {
    constructor() {
        this.fields = {
            fields: [
                async field => {
                    const value = field.getValue();
                    if (field.list) {
                        if (!Array.isArray(value)) {
                            return null;
                        }

                        const output = [];
                        for (let i = 0; i < value.length; i++) {
                            let valueElement = value[i];
                            output[i] = await this.toStorage({ fields: valueElement.getFields() });
                        }
                        return output;
                    }
                    return await this.toStorage({ fields: value.getFields() });
                }
            ]
        };
    }

    async toStorage({ fields }) {
        const output = {};
        for (let name in fields) {
            const field = fields[name];
            if (field.toStorage === false) {
                continue;
            }

            if (!field.isDirty()) {
                continue;
            }

            if (typeof field.getStorageValue === "function") {
                output[name] = await field.getStorageValue();
            } else {
                if (this.fields[field.type] && this.fields[field.type][0]) {
                    output[name] = await this.fields[field.type][0](field);
                } else {
                    output[name] = field.getValue();
                }
            }
        }

        return output;
    }

    async fromStorage({ data, fields }) {
        let name;
        for (name in fields) {
            const field = fields[name];
            if (field.toStorage === false) {
                continue;
            }

            if (name in data) {
                let value = data[name];

                if (typeof field.setStorageValue === "function") {
                    await field.setStorageValue(value);
                } else {
                    if (this.fields[field.type] && this.fields[field.type][1]) {
                        value = await this.fields[field.type][1](value);
                    }

                    field.setValue(value, {
                        skipDifferenceCheck: true,
                        forceSetAsClean: true
                    });
                }
            }
        }
    }
}

export default FieldsStorageAdapter;
