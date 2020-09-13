class MongoDbDriver {
    collections: Object;
    database: Object;
    aggregateTotalCount: ?boolean;

    constructor({ database, collections, aggregateTotalCount } = {}) {
        this.aggregateTotalCount = aggregateTotalCount;
        this.database = database;
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
            .insertOne(data);

        return [true];
    }

    async update(args) {
        const { name, query, data } = args;
        const collection = this.getCollectionName(name);
        await this.getClient()
            .collection(collection)
            .updateOne(query, { $set: data });

        return [true];
    }

    // eslint-disable-next-line
    async delete({ name, query }) {
        await this.getClient()
            .collection(this.getCollectionName(name))
            .deleteMany(query);

        return [true];
    }

    async read({ name, query, limit, offset, sort }) {
        const database = await this.getClient()
            .collection(this.getCollectionName(name))
            .find(query);

        if (limit > 0) {
            database.limit(limit);
        }

        if (offset > 0) {
            database.skip(offset);
        }

        if (sort && Object.keys(sort).length > 0) {
            database.sort(sort);
        }

        return [await database.toArray(), {}];
    }

    async count({ name, options }) {
        const clonedOptions = { ...options };

        const result = await this.getClient()
            .collection(this.getCollectionName(name))
            .countDocuments(clonedOptions.query);

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

export default MongoDbDriver;
