import { DocumentClient } from "aws-sdk/clients/dynamodb";
import QueryGenerator from "./QueryGenerator";

class DynamoDbClient {
    constructor({ documentClient } = {}) {
        this.client = documentClient || new DocumentClient();
    }

    async create(rawItems) {
        const items = Array.isArray(rawItems) ? rawItems : [rawItems];
        const results = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            results.push(
                await this.client
                    .put({
                        TableName: item.table,
                        Item: item.data
                    })
                    .promise()
            );
        }

        return results;
    }

    async delete(rawItems) {
        const items = Array.isArray(rawItems) ? rawItems : [rawItems];
        const results = [];
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            results.push(
                await this.client
                    .delete({
                        TableName: item.table,
                        Key: item.query
                    })
                    .promise()
            );
        }

        return results;
    }

    async update(rawItems) {
        const items = Array.isArray(rawItems) ? rawItems : [rawItems];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            const update = {
                UpdateExpression: "SET ",
                ExpressionAttributeNames: {},
                ExpressionAttributeValues: {}
            };

            const updateExpression = [];
            for (const key in item.data) {
                updateExpression.push(`#${key} = :${key}`);
                update.ExpressionAttributeNames[`#${key}`] = key;
                update.ExpressionAttributeValues[`:${key}`] = item.data[key];
            }

            update.UpdateExpression += updateExpression.join(", ");

            await this.client
                .update({
                    TableName: item.table,
                    Key: item.query,
                    ...update
                })
                .promise();
        }

        return true;
    }

    async findOne(rawItems) {
        const items = Array.isArray(rawItems) ? rawItems : [rawItems];
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            item.limit = 1;
        }
        return this.find(items);
    }

    async find(rawItems) {
        const items = Array.isArray(rawItems) ? rawItems : [rawItems];
        const results = [];
        for (let i = 0; i < items.length; i++) {
            let item = items[i];

            const queryGenerator = new QueryGenerator();
            const queryParams = queryGenerator.generate({ query: item.query, keys: item.keys });

            results.push(
                await this.client()
                    .query({
                        TableName: item.table,
                        Limit: item.limit,
                        IndexName: key.primary ? "Index" : key.name,
                        ...queryParams
                    })
                    .promise()
            );
        }

        return results;
    }

    async count() {
        throw new Error(`Cannot run "count" operation - not supported.`);
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

export default DynamoDbClient;
