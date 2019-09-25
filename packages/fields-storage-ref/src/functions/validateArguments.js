import { hasFields, WithFieldsError } from "@commodo/fields";

export default ({ instanceOf, list, using }) => {
    if (!instanceOf) {
        throw new WithFieldsError(
            `When defining a "ref" field, "instanceOf" argument must be set.`,
            WithFieldsError.MODEL_FIELD_INSTANCEOF_NOT_SET
        );
    }

    if (!hasFields(instanceOf)) {
        if (!Array.isArray(instanceOf)) {
            throw new WithFieldsError(
                `When defining a "ref" field, "instanceOf" must represent an object with fields.`,
                WithFieldsError.MODEL_FIELD_INSTANCEOF_NOT_SET
            );
        }

        // Deciding between `instanceOf: [A, B, C]` and `instanceOf: [[A, B, C], "fieldName"]`
        const instancesOf = typeof instanceOf[1] === "string" ? instanceOf[0] : instanceOf;

        for (let i = 0; i < instancesOf.length; i++) {
            let instanceOfElement = instanceOf[i];
            if (!hasFields(instanceOfElement)) {
                throw new WithFieldsError(
                    `When defining a "ref" field, an "instanceOf" array must contain refs with fields.`,
                    WithFieldsError.MODEL_FIELD_INSTANCEOF_NOT_SET
                );
            }
        }
    }

    if (list && using) {
        const usingInstanceOf = Array.isArray(using) ? using[0] : using;
        if (!hasFields(usingInstanceOf))
            throw new WithFieldsError(
                `When defining a "ref" field with "using" ref, and, "using" must represent an object with fields.`,
                WithFieldsError.MODEL_FIELD_INSTANCEOF_NOT_SET
            );
    }
};
