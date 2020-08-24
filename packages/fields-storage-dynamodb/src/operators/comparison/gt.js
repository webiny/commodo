const gt = {
    canProcess: ({ value }) => {
        return  value && typeof value["$gt"] !== "undefined";
    },
    process: ({ key, value }) => {
        return {
            expression: `#${key} > :${key}`,
            attributeNames: {
                [`#${key}`]: key
            },
            attributeValues: {
                [`:${key}`]: value["$gt"]
            }
        };
    }
};

module.exports = gt;
