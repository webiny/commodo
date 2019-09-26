import { getName } from "@commodo/name";
import mdbid from "mdbid";
class CustomDriver {
    constructor() {
        this.data = {};
    }

    async save({ model, isCreate }) {
        const method = isCreate ? "create" : "update";
        return this[method]({ model });
    }

    async create({ model }) {
        if (!model.id) {
            model.id = mdbid();
        }


        const namespace = getName(model);
        // Check if table exists.
        if (!this.data[namespace]) {
            this.data[namespace] = {};
        }

        this.data[namespace][model.id] = await model.toStorage();
    }

    async update({ model }) {
        const namespace = getName(model);
        // Check if table exists.
        if (!this.data[namespace]) {
            this.data[namespace] = {};
        }

        this.data[namespace][model.id] = await model.toStorage();
    }

    async delete({ model }) {
        const namespace = getName(model);

        if (!this.data[namespace]) {
            return;
        }

        if (!this.data[namespace][model.id]) {
            return;
        }

        delete this.data[namespace][model.id];
    }

    async count({ model, options }) {
        const [results, totalCount] = await this.find({ model, options });
        return totalCount || 0;
    }

    isId(value: any): boolean {
        return typeof value === "string" && !!value.match(/^[a-zA-Z0-9]*$/);
    }

    async findOne({ model, options }) {
        const namespace = getName(model);
        const records = this.data[namespace];
        if (!records) {
            return null;
        }

        let query = (options && options.query) || {};
        recordsLoop: for (const id in this.data[namespace]) {
            const record = this.data[namespace][id];
            for (const key in query) {
                const value = query[key];
                if (record[key] !== value) {
                    continue recordsLoop;
                }
            }
            return record;
        }
    }

    async find({ model, options }) {
        const namespace = getName(model);
        const records = this.data[namespace];
        if (!records) {
            return [];
        }

        const collection = [];

        let query = (options && options.query) || {};
        recordsLoop: for (const id in this.data[namespace]) {
            const record = this.data[namespace][id];
            for (const key in query) {
                const value = query[key];
                if (record[key] !== value) {
                    continue recordsLoop;
                }
            }
            collection.push(record);
        }

        return [collection, collection.length];
    }
}

export default CustomDriver;
