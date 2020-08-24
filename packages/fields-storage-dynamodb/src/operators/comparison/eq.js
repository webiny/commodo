const validTypes = ["string", "boolean", "number"];

const eq = {
    canProcess: ({ key, value }) => {
        if (key && key.charAt(0) === "$") {
            return false;
        }

        if (value && typeof value["$eq"] !== "undefined") {
            return true;
        }

        return validTypes.includes(typeof value);
    },
    process: ({ key, value }) => {
        return {
            expression: `#${key} = :${key}`,
            attributeNames: {
                [`#${key}`]: key
            },
            attributeValues: {
                [`:${key}`]: value
            }
        };
    }
};

module.exports = eq;
