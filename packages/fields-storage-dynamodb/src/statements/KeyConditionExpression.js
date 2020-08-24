const allOperators = require("./../operators");

class KeyConditionExpression {
    process(payload) {
        let output = [];

        outerLoop: for (const [key, value] of Object.entries(payload)) {
            const operators = Object.values(allOperators);
            for (let i = 0; i < operators.length; i++) {
                const operator = operators[i];
                if (operator.canProcess({ key, value })) {
                    output.push(operator.process({ key, value }));
                    continue outerLoop;
                }
            }
            throw new Error(`Invalid operator {${key} : ${value}}.`);
        }

        return output;
    }
}

module.exports = KeyConditionExpression;
