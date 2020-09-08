// @flow
import StoragePoolEntry from "./StoragePoolEntry";
import getPrimaryKey from "./getPrimaryKey";

function getPoolItemId(model, data) {
    const primaryKey = getPrimaryKey(model);
    const output = { namespace: model.getStorageName(), id: [] };

    for (let i = 0; i < primaryKey.fields.length; i++) {
        let field = primaryKey.fields[i];
        output.id.push(data ? data[field.name] : model[field.name]);
    }

    output.id.join(":");
    return output;
}

class StoragePool {
    pool: {};
    constructor() {
        this.pool = {};
    }

    getPool() {
        return this.pool;
    }

    add(model: $Subtype<CreateModel>): this {
        const { namespace, id } = getPoolItemId(model);
        if (!this.getPool()[namespace]) {
            this.getPool()[namespace] = {};
        }

        this.getPool()[namespace][id] = new StoragePoolEntry(model);
        return this;
    }

    remove(model): this {
        const { namespace, id } = getPoolItemId(model);
        if (!this.getPool()[namespace]) {
            return this;
        }

        delete this.getPool()[namespace][id];
        return this;
    }

    get(model, data: any = null) {
        const { namespace, id } = getPoolItemId(model, data);
        if (!this.getPool()[namespace]) {
            return undefined;
        }

        const poolEntry: StoragePoolEntry = this.getPool()[namespace][id];
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
