class FieldsStorageAdapter {
    constructor() {
        this.fields = {
            fields: [
                async field => {
                    const value = field.getValue();
                    if (value === null) {
                        return value;
                    }

                    if (field.list) {
                        const output = [];
                        for (let i = 0; i < value.length; i++) {
                            let valueElement = value[i];
                            output[i] = await this.toStorage({
                                fields: valueElement.getFields(),
                                skipDifferenceCheck: true
                            });
                        }
                        return output;
                    }

                    return await this.toStorage({
                        fields: value.getFields(),
                        skipDifferenceCheck: true
                    });
                },
                async (field, value) => {
                    if (value === null) {
                        return null;
                    }

                    if (field.list) {
                        const output = [];
                        for (let i = 0; i < value.length; i++) {
                            let valueElement = value[i];
                            const newModel = new field.instanceOf();
                            await this.fromStorage({
                                data: valueElement,
                                fields: newModel.getFields()
                            });
                            output.push(newModel);
                        }
                        return output;
                    }

                    const newModel = new field.instanceOf();
                    await this.fromStorage({
                        data: value,
                        fields: newModel.getFields()
                    });

                    return newModel;
                }
            ]
        };
    }

    async toStorage({ fields, skipDifferenceCheck }) {
        const output = {};
        for (let name in fields) {
            const field = fields[name];
            if (field.toStorage === false) {
                continue;
            }

            if (!(skipDifferenceCheck === true)) {
                if (!field.isDirty()) {
                    continue;
                }
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
                        value = await this.fields[field.type][1](field, value);
                    }

                    // Directly set the value and set "set" property as true.
                    field.current = value;
                    field.state.set = true;
                }
            }
        }
    }
}

export default FieldsStorageAdapter;
