import KeyConditionExpression from "./statements/KeyConditionExpression";

// const key = findQueryKey(item.query, item.keys);
// const keyConditionExpression = new KeyConditionExpression().process(item.query);

class QueryGenerator {
    generate({ query, keys }) {
        // 1. Which key can we use in this query operation?
        const key = this.findQueryKey(query, keys);

        // 2. Now that we know the key, let's separate the key attributes from the rest.
        const keyAttributesValues = {},
            nonKeyAttributesValues = {};
        for (let queryKey in query) {
            if (key.fields.find(item => item.name === queryKey)) {
                keyAttributesValues[queryKey] = query[queryKey];
            } else {
                nonKeyAttributesValues[queryKey] = query[queryKey];
            }
        }
    }

    findQueryKey(query = {}, keys = []) {
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let hasAllFields = true;
            for (let j = 0; j < key.fields.length; j++) {
                let field = key.fields[j];
                if (!query[field.name]) {
                    hasAllFields = false;
                    break;
                }
            }

            if (hasAllFields) {
                return key;
            }
        }
    }
}

export default QueryGenerator;
