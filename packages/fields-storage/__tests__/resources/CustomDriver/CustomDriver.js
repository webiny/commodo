class CustomDriver {
    constructor() {
        this.data = {};
    }

    async save({ name, data, isCreate }) {
        const method = isCreate ? "create" : "update";
        return this[method]({ name, data });
    }

    async create({ name, data }) {
        // Check if table exists.
        if (!this.data[name]) {
            this.data[name] = {};
        }

        this.data[name][data.id] = data;
    }

    async update({ name, data }) {
        // Check if table exists.
        if (!this.data[name]) {
            this.data[name] = {};
        }

        this.data[name][data.id] = data;
    }

    async delete({ name, data }) {
        if (!this.data[name]) {
            return;
        }

        if (!this.data[name][data.id]) {
            return;
        }

        delete this.data[name][data.id];
    }

    async count({ name, options }) {
        const [, meta] = await this.find({
            name,
            options: { ...options, totalCount: true }
        });

        return meta.totalCount;
    }

    async findOne({ name, options }) {
        const records = this.data[name];
        if (!records) {
            return null;
        }

        let query = (options && options.query) || {};
        recordsLoop: for (const id in this.data[name]) {
            const record = this.data[name][id];
            for (const key in query) {
                const value = query[key];
                if (record[key] !== value) {
                    continue recordsLoop;
                }
            }
            return record;
        }
    }

    async find({ name, options }) {
        const records = this.data[name];
        if (!records) {
            return [[], { totalCount: options.totalCount ? 0 : null }];
        }

        const collection = [];

        let query = (options && options.query) || {};
        recordsLoop: for (const id in this.data[name]) {
            const record = this.data[name][id];
            for (const key in query) {
                const value = query[key];
                if (record[key] !== value) {
                    continue recordsLoop;
                }
            }
            collection.push(record);
        }

        const meta = {};
        if (options.totalCount) {
            meta.totalCount = collection.length;
        }

        return [collection, meta];
    }
}

export default CustomDriver;
