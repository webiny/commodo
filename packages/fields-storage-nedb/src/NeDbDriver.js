import Database from "./Database";

class NeDbDriver {
    constructor({ collections, database } = {}) {
        this.database = database || new Database();
        this.collections = {
            prefix: "",
            naming: null,
            ...collections
        };
    }

    getClient() {
        return this.database;
    }

    async create(args) {
        const { name, data } = args;
        await this.getClient()
            .collection(this.getCollectionName(name))
            .insert(data);

        return [true, {}];
    }

    async update(args) {
        const { name, query, data } = args;
        const collection = this.getCollectionName(name);
        await this.getClient()
            .collection(collection)
            .update(query, { $set: data }, { multi: true });

        return [true, {}];
    }

    // eslint-disable-next-line
    async delete({ name, options }) {
        const clonedOptions = { ...options };

        await this.getClient()
            .collection(this.getCollectionName(name))
            .remove(clonedOptions.query, { multi: true });
        return [true, {}];
    }

    async read(args) {
        const { name, options } = args;
        const clonedArgs = { limit: 0, offset: 0, ...options };

        const result = await this.getClient()
            .collection(this.getCollectionName(name))
            .find(clonedArgs.query)
            .limit(clonedArgs.limit)
            .skip(clonedArgs.offset)
            .sort(clonedArgs.sort);

        return [result, {}];
    }

    async count({ name, options }) {
        const clonedOptions = { ...options };

        const result = await this.getClient()
            .collection(this.getCollectionName(name))
            .count(clonedOptions.query);

        return [result, {}];
    }

    setCollectionPrefix(collectionPrefix) {
        this.collections.prefix = collectionPrefix;
        return this;
    }

    getCollectionPrefix() {
        return this.collections.prefix;
    }

    setCollectionNaming(collectionNameValue) {
        this.collections.naming = collectionNameValue;
        return this;
    }

    getCollectionNaming() {
        return this.collections.naming;
    }

    getCollectionName(name) {
        const getCollectionName = this.getCollectionNaming();
        if (typeof getCollectionName === "function") {
            return getCollectionName({ name, driver: this });
        }

        return this.collections.prefix + name;
    }
}

export default NeDbDriver;
