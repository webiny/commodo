import isNeDbId from "./isId";
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

    async create(items) {
        for (let i = 0; i < items.length; i++) {
            const { name, data } = items[i];
            await this.getDatabase()
                .collection(this.getCollectionName(name))
                .insert(data);
        }

        return true;
    }

    async update(items) {
        for (let i = 0; i < items.length; i++) {
            const { name, query, data } = items[i];
            const collection = this.getCollectionName(name);
            await this.getDatabase()
                .collection(collection)
                .update(query, { $set: data }, { multi: true });
        }

        return true;
    }

    // eslint-disable-next-line
    async delete({ name, options }) {
        const clonedOptions = { ...options };

        NeDbDriver.__prepareSearchOption(clonedOptions);
        await this.getDatabase()
            .collection(this.getCollectionName(name))
            .remove(clonedOptions.query, { multi: true });
        return true;
    }

    async find({ name, options }) {
        const clonedOptions = { limit: 0, offset: 0, ...options };

        NeDbDriver.__prepareSearchOption(clonedOptions);
        NeDbDriver.__prepareProjectFields(clonedOptions);

        const projection = {};
        if (Array.isArray(options.fields) && options.fields.length > 0) {
            for (let i = 0; i < options.fields.length; i++) {
                projection[options.fields[i]] = 1;
            }
        }

        const result = await this.getDatabase()
            .collection(this.getCollectionName(name))
            .find(clonedOptions.query, projection)
            .limit(clonedOptions.limit)
            .skip(clonedOptions.offset)
            .sort(clonedOptions.sort);

        return [result, {}];
    }

    async findOne({ name, options }) {
        const clonedOptions = { ...options };
        NeDbDriver.__prepareSearchOption(clonedOptions);
        NeDbDriver.__prepareProjectFields(clonedOptions);

        const projection = {};
        if (Array.isArray(options.fields) && options.fields.length > 0) {
            for (let i = 0; i < options.fields.length; i++) {
                projection[options.fields[i]] = 1;
            }
        }

        const [result] = await this.getDatabase()
            .collection(this.getCollectionName(name))
            .find(clonedOptions.query, projection)
            .limit(1)
            .sort(clonedOptions.sort);

        return result;
    }

    async count({ name, options }) {
        const clonedOptions = { ...options };
        NeDbDriver.__prepareSearchOption(clonedOptions);

        return await this.getDatabase()
            .collection(this.getCollectionName(name))
            .count(clonedOptions.query);
    }

    isId(value) {
        return isNeDbId(value);
    }

    getDatabase() {
        return this.database;
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

    static __prepareSearchOption(options) {
        // Here we handle search (if passed) - we transform received arguments into linked LIKE statements.
        if (options.search && options.search.query) {
            const { query, operator, fields } = options.search;

            const searches = [];
            fields.forEach(field => {
                searches.push({ [field]: { $regex: `.*${query}.*`, $options: "i" } });
            });

            const search = {
                [operator === "and" ? "$and" : "$or"]: searches
            };

            if (options.query instanceof Object) {
                options.query = {
                    $and: [search, options.query]
                };
            } else {
                options.query = search;
            }

            delete options.search;
        }
    }

    static __prepareProjectFields(options) {
        // Here we convert requested fields into a "project" parameter
        if (options.fields) {
            options.project = options.fields.reduce(
                (acc, item) => {
                    acc[item] = 1;
                    return acc;
                },
                { id: 1 }
            );

            delete options.fields;
        }
    }
}

export default NeDbDriver;
