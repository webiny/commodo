import { type FieldFactory } from "@commodo/fields/types";

const createField: FieldFactory = ({ type, list, validation, ...rest }) => {
    return function(parent) {
        const instance = {
            parent,
            name: "",
            type,
            list,
            validation,
            current: null,
            state: { loading: false, loaded: false, dirty: false, set: false },

            getValue() {
                return this.current;
            },
            setValue(value: any, options: Object = {}) {
                // If needed, implement skipMarkAsSet option (at the time of implementation, it was not needed).
                this.set = true;

                if (options.skipDifferenceCheck) {
                    if (options.forceSetAsDirty) {
                        this.state.dirty = true;
                    } else {
                        if (options.forceSetAsClean) {
                            this.state.dirty = false;
                        }
                    }
                } else {
                    if (!this.state.dirty && this.isDifferentFrom(value)) {
                        this.state.dirty = true;
                    }
                }

                this.current = value;
                return this;
            },

            isDifferentFrom(value: mixed): boolean {
                return this.current !== value;
            },

            isDirty(): boolean {
                return this.state.dirty;
            },

            clean() {
                this.state.dirty = false;
                return this;
            },

            isEmpty() {
                return this.current === null || typeof this.current === "undefined";
            },

            isSet(): boolean {
                return this.state.set;
            },

            reset(): void {
                this.current = null;
                this.state.dirty = false;
                this.state.set = false;
            },

            async validate() {
                if (typeof this.validation === "function") {
                    await this.validation(await this.getValue());
                }
            }
        };

        if ('value' in rest) {
            instance.setValue(rest.value);
        }

        return instance;
    };
};

export default createField;
