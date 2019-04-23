// @flow
import { Model } from ".";

class StoragePoolEntry {
    model: Model;
    meta: Object;

    constructor(model: $Subtype<Model>) {
        this.model = model;
        this.meta = {
            createdOn: new Date()
        };
    }

    getModel(): $Subtype<Model> {
        return this.model;
    }

    setModel(model: $Subtype<Model>): this {
        this.model = model;
        return this;
    }

    getMeta(): Object {
        return this.meta;
    }

    setMeta(meta: Object): this {
        this.meta = meta;
        return this;
    }
}

export default StoragePoolEntry;
