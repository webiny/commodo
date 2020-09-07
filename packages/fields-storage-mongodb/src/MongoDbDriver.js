// @flow
import { clone } from "ramda";
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

    async create(items: Array<Object>) {
        for (let i = 0; i < items.length; i++) {
            const { name, data } = items[i];
            await this.getDatabase()
                .collection(this.getCollectionName(name))
                .insertOne(data);
        }

        return true;
    }

    async update(items: Array<Object>) {
        for (let i = 0; i < items.length; i++) {
            const { name, query, data } = items[i];
            const collection = this.getCollectionName(name);
            await this.getDatabase()
                .collection(collection)
                .updateOne(query, { $set: data });
        }

        return true;
    }

    // eslint-disable-next-line
    async delete({ name, options }) {
        const clonedOptions = { ...options };

        await this.getDatabase()
            .collection(this.getCollectionName(name))
            .deleteMany(clonedOptions.query);
        return true;
    }

    async find({ name, options }) {
        const clonedOptions = { limit: 0, offset: 0, ...options };

        MongoDbDriver.__prepareProjectFields(clonedOptions);

        const database = await this.getDatabase()
            .collection(this.getCollectionName(name))
            .find(clonedOptions.query)
            .limit(clonedOptions.limit)
            .skip(clonedOptions.offset);

        if (Array.isArray(options.fields) && options.fields.length > 0) {
            database.project(clonedOptions.project);
        }

        if (clonedOptions.sort && Object.keys(clonedOptions.sort).length > 0) {
            database.sort(clonedOptions.sort);
        }

        return [await database.toArray(), {}];
    }

    async findOne({ name, options }) {
        const clonedOptions = { ...options };
        MongoDbDriver.__prepareProjectFields(clonedOptions);

        const database = await this.getDatabase()
            .collection(this.getCollectionName(name))
            .find(clonedOptions.query)
            .limit(1)
            .sort(clonedOptions.sort);

        if (Array.isArray(options.fields) && options.fields.length > 0) {
            database.project(clonedOptions.project);
        }

        const result = await database.toArray();

        return result[0];
    }

    async count({ name, options }) {
        const clonedOptions = { ...options };

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

export default MongoDbDriver;
