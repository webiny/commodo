class Collection extends Array {
    __model: { params: Object, meta: Object };

    constructor(values: Array<T> = []) {
        super();
        this.__model = { params: {}, meta: {} };
        if (Array.isArray(values)) {
            values.map(item => this.push(item));
        }
    }

    setParams(params: Object): this {
        this.__model.params = params;
        return this;
    }

    getParams(): Object {
        return this.__model.params;
    }

    setMeta(meta: Object): this {
        this.__model.meta = meta;
        return this;
    }

    getMeta(): Object {
        return this.__model.meta;
    }

    setTotalCount(totalCount: number): this {
        this.__model.meta.totalCount = totalCount;
        return this;
    }

    getTotalCount(): number {
        return this.__model.meta.totalCount;
    }
}

export default Collection;
