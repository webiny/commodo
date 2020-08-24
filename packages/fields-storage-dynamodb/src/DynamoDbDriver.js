import DynamoDbClient from "./DynamoDbClient";
import { getKeys } from "@commodo/fields-storage";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

class DynamoDbDriver {
    constructor({ documentClient, tableName } = {}) {
        this.documentClient = new DynamoDbClient({
            documentClient: documentClient || new DocumentClient()
        });

        this.tableName = tableName;
    }

    getDocumentClient() {
        return this.documentClient;
    }

    async create({ model }) {
        const table = this.getTableName(model);
        const data = await model.toStorage();
        return this.getDocumentClient().create({ table, data });
    }

    async update({ model, primaryKey }) {
        const table = this.getTableName(model);
        const query = {};
        for (let i = 0; i < primaryKey.fields.length; i++) {
            let field = primaryKey.fields[i];
            query[field.name] = model[field.name];
        }

        const data = await model.toStorage();

        return this.getDocumentClient().update({ table, data, query });
    }

    async delete({ model, primaryKey }) {
        const table = this.getTableName(model);
        const query = {};
        for (let i = 0; i < primaryKey.fields.length; i++) {
            let field = primaryKey.fields[i];
            query[field.name] = model[field.name];
        }

        return this.getDocumentClient().delete({ table, query });
    }

    async findOne({ model, args }) {
        const table = this.getTableName(model);
        return this.getDocumentClient().findOne({ ...args, table, keys: getKeys(model) });
    }

    async find({ model, args }) {
        const table = this.getTableName(model);
        return this.getDocumentClient().find({ ...args, table, keys: getKeys(model) });
    }

    async count({ model }) {
        const table = this.getTableName(model);

        // Will throw an error - counts not supported in DynamoDb.
        return this.getDocumentClient().count({ table });
    }

    getTableName(model) {
        return this.tableName || model.getStorageName();
    }
}

module.exports = DynamoDbDriver;
