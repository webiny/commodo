const beginsWith = {
    canProcess: ({ value }) => {
        return value && typeof value["$beginsWith"] !== "undefined";
    },
    process: ({ key, value }) => {
        return {
            statement: `begins_with (#${key}, :${key})`,
            attributeNames: {
                [`#${key}`]: key
            },
            attributeValues: {
                [`:${key}`]: value["$beginsWith"]
            }
        };
    }
};

module.exports = beginsWith;
