const AWS = require("aws-sdk");
const KeyConditionExpression = require("./statements/KeyConditionExpression");


class DynamoDbDriver {
    constructor({ client } = {}) {
        this.client = new DynamoDbClient({
            client: client || new AWS.DynamoDB.DocumentClient()
        });
    }

    getClient() {
        return this.client;
    }

    async create({ items, model }) {
        return this.client.create(items);
    }

    async update({ items, model }) {
        return this.client.update(items);
    }

    async delete({ name, options, model }) {
        return this.client.delete({ name, options });
    }

    async find({ name, options, model }) {
        return this.client.find({ name, options });
    }

    async findOne({ name, options, model }) {
        return this.client.findOne({ name, options });
    }

    async count({ name, options, model }) {
        return this.client.count({ name, options });
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

module.exports = DynamoDbDriver;

/*const driver = new DynamoDbDriver();
(async () => {
    await driver.getClient().find({
        tableName: "asd",
        query: {
            pk: "123",
            sk: { $beginsWith: "abc" }
        }
    });
})();*/

/*
exports.handler = async (event) => {
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };

    const start = new Date();
    const driver = new DynamoDb();

    // await driver.client.create({ table: "wby-i18n", data: { pk: "test5", sk: "woaah", isAwesome: 'weee' } });
    // await driver.client.update({ table: "wby-i18n", query: { pk: "test10", sk: 'test10:go' }, data: {isAwesome: 'wooooo11'} });

    console.log(await driver.client.findOne({ table: "wby-i18n", query: { pk: "test10", sk: 'test10:go' } }))

    // await driver.client.delete({ table: "wby-i18n", query: { pk: "test6", sk: 'woaah' } });

    console.log("DDB duration", new Date() - start);
    return response;

};
*/
