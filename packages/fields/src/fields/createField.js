import { type FieldFactory } from "@commodo/fields/types";

const createField: FieldFactory = ({ type, list, validation, get, set, value }) => {
    return function(name, parent) {
        this.get = get;
        this.set = set;
        this.name = name;
        this.parent = parent;
        this.type = type;
        this.list = list;
        this.validation = validation;
        this.current = null;
        this.state = { loading: false, loaded: false, dirty: false, set: false };

        this.getValue = () => {
            return this.current;
        };

        this.setValue = (value: any, options: Object = {}) => {
            // If needed, implement skipMarkAsSet option (at the time of implementation, it was not needed).
            this.state.set = true;

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
        };

        this.isDifferentFrom = (value: mixed) => {
            return this.current !== value;
        };

        this.isDirty = () => {
            return this.state.dirty;
        };

        this.clean = () => {
            this.state.dirty = false;
            return this;
        };

        this.isEmpty = () => {
            return this.current === null || typeof this.current === "undefined";
        };

        this.isSet = () => {
            return this.state.set;
        };

        this.reset = () => {
            this.current = null;
            this.state.dirty = false;
            this.state.set = false;
        };

        this.validate = async () => {
            if (typeof this.validation === "function") {
                await this.validation(await this.getValue());
            }
        };

        typeof this.construct === "function" && this.construct();
        typeof this.init === "function" && this.init();

        if (typeof value !== "undefined") {
            this.setValue(value);
        }
    };
};

export default createField;
