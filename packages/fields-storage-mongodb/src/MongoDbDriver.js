// @flow
import mongodb from "mongodb";
import isMongoDbId from "./isMongoDbId";
import generateMongoDbId from "./generateMongoDbId";
import { getName } from "@commodo/name";

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
    async save({ model, isCreate }) {
        return isCreate ? this.create({ model }) : this.update({ model });
    }

    async create({ model }: Object) {
        if (!model.id) {
            model.id = generateMongoDbId();
        }

        const data = await model.toStorage();
        data._id = new mongodb.ObjectID(model.id);

        try {
            await this.getDatabase()
                .collection(this.getCollectionName(model))
                .insertOne(data);
            return true;
        } catch (e) {
            model.id && model.getField("id").reset();
            throw e;
        }
    }

    async update({ model }: Object) {
        const data = await model.toStorage();

        await this.getDatabase()
            .collection(this.getCollectionName(model))
            .updateOne({ id: model.id }, { $set: data });

        return true;
    }

    // eslint-disable-next-line
    async delete({ model }) {
        await this.getDatabase()
            .collection(this.getCollectionName(model))
            .deleteOne({ id: model.id });
        return true;
    }

    async find({ model, options }) {
        const clonedOptions = { limit: 0, offset: 0, ...options };

        MongoDbDriver.__prepareSearchOption(clonedOptions);

        const database = await this.getDatabase()
            .collection(this.getCollectionName(model))
            .find(clonedOptions.query)
            .limit(clonedOptions.limit)
            .skip(clonedOptions.offset);

        if (clonedOptions.sort && Object.keys(clonedOptions.sort).length > 0) {
            database.sort(clonedOptions.sort);
        }

        return [await database.toArray(), {}];
    }

    async findOne({ model, options }) {
        const clonedOptions = { ...options };
        MongoDbDriver.__prepareSearchOption(clonedOptions);

        const results = await this.getDatabase()
            .collection(this.getCollectionName(model))
            .find(clonedOptions.query)
            .limit(1)
            .sort(clonedOptions.sort)
            .toArray();

        return results[0];
    }

    async count({ model, options }) {
        const clonedOptions = { ...options };
        MongoDbDriver.__prepareSearchOption(clonedOptions);

        return await this.getDatabase()
            .collection(this.getCollectionName(model))
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

    getCollectionName(model) {
        const getCollectionName = this.getCollectionNaming();
        if (typeof getCollectionName === "function") {
            return getCollectionName({ model, driver: this });
        }

        return this.collections.prefix + getName(model);
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
