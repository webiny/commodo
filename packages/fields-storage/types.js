export type OrderTuple = [string, number];

export type FindParams = {
    query?: Object,
    page?: number,
    perPage?: number,
    order?: Array<OrderTuple>,
    includeDeleted?: boolean
};

export type FindOneParams = {
    query?: Object,
    includeDeleted?: boolean
};

export type SaveParams = {
    validation?: boolean,
    hooks?: {
        beforeSave?: boolean,
        beforeUpdate?: boolean,
        beforeCreate?: boolean,
        afterSave?: boolean,
        afterUpdate?: boolean,
        afterCreate?: boolean,
        __update?: boolean,
        __beforeUpdate?: boolean,
        __afterUpdate?: boolean,
        __create?: boolean,
        __beforeCreate?: boolean,
        __afterCreate?: boolean,
        __save?: boolean,
        __beforeSave?: boolean,
        __afterSave?: boolean,
    }
};

export type DeleteParams = {
    validation?: boolean,
    permanent?: boolean,
    events?: {
        delete?: boolean,
        beforeDelete?: boolean,
        afterDelete?: boolean
    }
};

export type AttributeOptions = {
    refNameField?: string
};

export type EntitiesAttributeOptions = {
    refNameField?: string
};
