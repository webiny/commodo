import { DocumentClient } from "aws-sdk/clients/dynamodb";
import BatchProcess from "./BatchProcess";
import QueryGenerator from "./QueryGenerator";

const propertyIsPartOfUniqueKey = (property, keys) => {
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!key.unique) {
            continue;
        }

        let fields = keys[i].fields;
        if (!Array.isArray(fields)) {
            continue;
        }

        for (let j = 0; j < fields.length; j++) {
            let field = fields[j];
            if (field.name === property) {
                return true;
            }
        }
    }
    return false;
};

class DynamoDbDriver {
    constructor({ documentClient, tableName } = {}) {
        this.batchProcesses = {};
        this.documentClient = documentClient || new DocumentClient();
        this.tableName = tableName;
    }

    getClient() {
        return this.documentClient;
    }

    async create({ name, data, batch }) {
        const tableName = this.tableName || name;
        if (!batch) {
            const result = await this.documentClient
                .put({ TableName: tableName, Item: data })
                .promise();
            return [true, { response: result.$response }];
        }

        const batchProcess = this.getBatchProcess(batch);
        batchProcess.addBatchWrite({ tableName, data });

        if (batchProcess.allOperationsAdded()) {
            batchProcess.startExecution();
        } else {
            await batchProcess.waitStartExecution();
        }

        await batchProcess.waitExecution();

        return [true, { response: batchProcess.$response }];
    }

    async update({ query, data, name, batch, instance, keys }) {
        const tableName = this.tableName || name;

        if (!batch) {
            const update = {
                UpdateExpression: "SET ",
                ExpressionAttributeNames: {},
                ExpressionAttributeValues: {}
            };

            const updateExpression = [];
            for (const key in data) {
                updateExpression.push(`#${key} = :${key}`);
                update.ExpressionAttributeNames[`#${key}`] = key;
                update.ExpressionAttributeValues[`:${key}`] = data[key];
            }

            update.UpdateExpression += updateExpression.join(", ");

            const result = await this.documentClient
                .update({
                    TableName: tableName,
                    Key: query,
                    ...update
                })
                .promise();

            return [true, { response: result.$response }];
        }

        const batchProcess = this.getBatchProcess(batch);

        // It would be nice if we could rely on the received data all the time, but that's not possible. Because
        // "PutRequest" operations only insert or overwrite existing data (meaning => classic updates are NOT allowed),
        // we must get complete model data, and use that in the operation. This is possible only if the update
        // call is part of an model instance update (not part of SomeModel.save() call), where we can access the
        // toStorage function. So, if that's the case, we'll call it with the skipDifferenceCheck flag enabled.
        // Normally we wouldn't have to do all of this dancing, but it's how DynamoDB works, there's no way around it.
        const storageData = instance
            ? await instance.toStorage({ skipDifferenceCheck: true })
            : data;

        // The only problem with the above approach is that it may insert null values into GSI columns,
        // which immediately gets rejected by DynamoDB. Let's remove those here.
        const Item = {};
        for (let property in storageData) {
            // Check if key is a part of a unique index. If so, and is null, remove it from data.
            if (!propertyIsPartOfUniqueKey(property, keys)) {
                Item[property] = storageData[property];
                continue;
            }

            if (storageData[property] !== null) {
                Item[property] = storageData[property];
            }
        }

        batchProcess.addBatchWrite({
            tableName,
            data: Item
        });

        if (batchProcess.allOperationsAdded()) {
            batchProcess.startExecution();
        } else {
            await batchProcess.waitStartExecution();
        }

        await batchProcess.waitExecution();

        return [true, { response: batchProcess.response }];
    }

    async delete({ query, name, batch }) {
        const tableName = this.tableName || name;

        if (!batch) {
            const result = await this.documentClient
                .delete({
                    TableName: tableName,
                    Key: query
                })
                .promise();

            return [true, { response: result.$response }];
        }

        const batchProcess = this.getBatchProcess(batch);
        const getResult = batchProcess.addBatchDelete({
            tableName,
            query
        });

        if (batchProcess.allOperationsAdded()) {
            batchProcess.startExecution();
        } else {
            await batchProcess.waitStartExecution();
        }

        await batchProcess.waitExecution();

        return [true, { response: batchProcess.response }];
    }

    async find({ name, query, sort, limit, batch, keys }) {
        const tableName = this.tableName || name;

        if (!batch) {
            const queryGenerator = new QueryGenerator();
            const queryParams = queryGenerator.generate({
                query,
                keys,
                sort,
                limit,
                tableName
            });

            const response = await this.documentClient.query(queryParams).promise();
            return [response.Items, { response: response.$response }];
        }

        // DynamoDb doesn't support batch queries, so we can immediately assume the GetRequest operation.
        const batchProcess = this.getBatchProcess(batch);
        const getResult = batchProcess.addBatchGet({
            tableName,
            query
        });

        if (batchProcess.allOperationsAdded()) {
            batchProcess.startExecution();
        } else {
            await batchProcess.waitStartExecution();
        }

        await batchProcess.waitExecution();

        const result = getResult();
        if (result) {
            return [[result], {}];
        }

        return [[], {}];
    }

    async count() {
        throw new Error(`Cannot run "count" operation - not supported.`);
    }

    getBatchProcess(batch) {
        if (!this.batchProcesses[batch.id]) {
            this.batchProcesses[batch.id] = new BatchProcess(batch, this.documentClient);
        }

        return this.batchProcesses[batch.id];
    }
}

export default DynamoDbDriver;
