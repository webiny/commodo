// @flow
import { getName } from "@commodo/name";
import StoragePoolEntry from "./StoragePoolEntry";

class StoragePool {
    pool: {};
    constructor() {
        this.pool = {};
    }

    getPool() {
        return this.pool;
    }

    add(model: $Subtype<Model>): this {
        const namespace = getName(model);
        if (!this.getPool()[namespace]) {
            this.getPool()[namespace] = {};
        }

        this.getPool()[namespace][model.id] = new StoragePoolEntry(model);
        return this;
    }

    has(model, id): boolean {
        const namespace = getName(model);
        if (!this.getPool()[namespace]) {
            return false;
        }

        const modelId = id || model.id;
        return typeof this.getPool()[namespace][modelId] !== "undefined";
    }

    remove(model): this {
        const namespace = getName(model);
        if (!this.getPool()[namespace]) {
            return this;
        }

        delete this.getPool()[namespace][model.id];
        return this;
    }

    get(model: Class<$Subtype<Model>> | Model, id: ?mixed): ?Model {
        const namespace = getName(model);
        if (!this.getPool()[namespace]) {
            return undefined;
        }

        const modelId = id || model.id;
        const poolEntry: StoragePoolEntry = this.getPool()[namespace][modelId];
        if (poolEntry) {
            return poolEntry.getModel();
        }
        return undefined;
    }

    flush(): this {
        this.pool = {};
        return this;
    }
}

export default StoragePool;
