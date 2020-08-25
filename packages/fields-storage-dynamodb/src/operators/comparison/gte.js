const gte = {
    canProcess: ({ value }) => {
        return value && typeof value["$gte"] !== "undefined";
    },
    process: ({ key, value }) => {
        return {
            expression: `#${key} >= :${key}`,
            attributeNames: {
                [`#${key}`]: key
            },
            attributeValues: {
                [`:${key}`]: value["$gt"]
            }
        };
    }
};
module.exports = gte;
