const lte = {
    canProcess: ({ value }) => {
        return value && typeof value["$lte"] !== "undefined";
    },
    process: ({ key, value }) => {
        return {
            expression: `#${key} <= :${key}`,
            attributeNames: {
                [`#${key}`]: key
            },
            attributeValues: {
                [`:${key}`]: value["$gt"]
            }
        };
    }
};
module.exports = lte;
