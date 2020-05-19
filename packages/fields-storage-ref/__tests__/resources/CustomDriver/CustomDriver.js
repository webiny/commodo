class CustomDriver {
    constructor() {
        this.data = {};
    }

    async create(items) {
        for (let i = 0; i < items.length; i++) {
            const { name, data } = items[i];
            if (!this.data[name]) {
                this.data[name] = {};
            }

            this.data[name][data.id] = data;
        }
    }

    async update(items) {
        for (let i = 0; i < items.length; i++) {
            const { name, data } = items[i];
            if (!this.data[name]) {
                this.data[name] = {};
            }

            this.data[name][data.id] = data;
        }
    }

    async delete({ name, options }) {
        const records = this.data[name];
        if (!records) {
            return null;
        }
        let query = (options && options.query) || {};
        recordsLoop: for (const id in this.data[name]) {
            const record = this.data[name][id];
            for (const key in query) {
                if (record[key] !== query[key]) {
                    continue recordsLoop;
                }
            }
            delete this.data[name][id];
        }
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
