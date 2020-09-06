const isObject = value => value && typeof value === "object";

const and = {
    canProcess: ({ key }) => {
        return key === "$and";
    },
    process: ({ value, args, processStatement }) => {
        const andArgs = {
            expression: "",
            attributeNames: {},
            attributeValues: {}
        };

        switch (true) {
            /*  case Array.isArray(value):
                value.forEach(object => {
                    for (const [andKey, andValue] of Object.entries(object)) {
                        if (andArgs.expression === "") {
                            processStatement({
                                args: andArgs,
                                query: { [andKey]: andValue }
                            });
                        } else {
                            andExpression +=
                                " AND " + processStatement({ args: andArgs, query: { [andKey]: andValue } });

                        }
                    }
                });
                break;*/
            case isObject(value): {
                for (const [andKey, andValue] of Object.entries(value)) {
                    const currentArgs = {
                        expression: "",
                        attributeNames: {},
                        attributeValues: {}
                    };

                    processStatement({ args: currentArgs, query: { [andKey]: andValue } });

                    Object.assign(andArgs.attributeNames, currentArgs.attributeNames);
                    Object.assign(andArgs.attributeValues, currentArgs.attributeValues);

                    if (andArgs.expression === "") {
                        andArgs.expression = currentArgs.expression;
                    } else {
                        andArgs.expression += " and " + currentArgs.expression;
                    }
                }
                break;
            }
            default:
                throw Error("$and operator must receive an object or an array.");
        }

        args.expression += "(" + andArgs.expression + ")";
        Object.assign(args.attributeNames, andArgs.attributeNames);
        Object.assign(args.attributeValues, andArgs.attributeValues);
    }
};

export default and;
