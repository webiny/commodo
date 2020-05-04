// @flow
import mongodb from "mongodb";
import isMongoDbId from "./isMongoDbId";

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

    // eslint-disable-next-line
    async save({ name, data, isCreate }) {
        return isCreate ? this.create({ name, data }) : this.update({ name, data });
    }

    async create({ name, data }: Object) {
        data._id = new mongodb.ObjectID(data.id);

        await this.getDatabase()
            .collection(this.getCollectionName(name))
            .insertOne(data);
        return true;
    }

    async update({ name, data }: Object) {
        const collection = this.getCollectionName(name);
        await this.getDatabase()
            .collection(collection)
            .updateOne({ id: data.id }, { $set: data });

        return true;
    }

    // eslint-disable-next-line
    async delete({ name, data: { id } }) {
        await this.getDatabase()
            .collection(this.getCollectionName(name))
            .deleteOne({ id });
        return true;
    }

    async find({ name, options }) {
        const clonedOptions = { limit: 0, offset: 0, ...options };

        MongoDbDriver.__prepareSearchOption(clonedOptions);

        const database = await this.getDatabase()
            .collection(this.getCollectionName(name))
            .find(clonedOptions.query)
            .limit(clonedOptions.limit)
            .skip(clonedOptions.offset);

        if (clonedOptions.sort && Object.keys(clonedOptions.sort).length > 0) {
            database.sort(clonedOptions.sort);
        }

        return [await database.toArray(), {}];
    }

    async findOne({ name, options }) {
        const clonedOptions = { ...options };
        MongoDbDriver.__prepareSearchOption(clonedOptions);

        const results = await this.getDatabase()
            .collection(this.getCollectionName(name))
            .find(clonedOptions.query)
            .limit(1)
            .sort(clonedOptions.sort)
            .toArray();

        return results[0];
    }

    async count({ name, options }) {
        const clonedOptions = { ...options };
        MongoDbDriver.__prepareSearchOption(clonedOptions);

        return await this.getDatabase()
            .collection(this.getCollectionName(name))
            .countDocuments(clonedOptions.query);
    }

    isId(value: any): boolean {
        return isMongoDbId(value);
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

    static __prepareSearchOption(options: Object) {
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
}

export default MongoDbDriver;
