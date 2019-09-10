import { withFields, onSet, string, number, boolean } from "@commodo/fields";
import { withName } from "@commodo/name";
import { compose } from "ramda";
import createModel from "./resources/models/createModel";

const User = compose(
    withFields({
        firstName: string(),
        lastName: string(),
        age: number(),
        enabled: boolean(),
        someValue: onSet(value => value + "-UPDATED")(string())
    }),
    withName("User")
)(createModel());

describe("populate from storage", () => {
    test(`each field's "set" property must be set to true`, async () => {
        const user = new User();
        user.populateFromStorage({
            firstName: "a",
            lastName: "b",
            age: 40,
            enabled: true,
            someValue: "e"
        });

        expect(user.getField("firstName").isSet()).toBe(true);
        expect(user.getField("lastName").isSet()).toBe(true);
        expect(user.getField("age").isSet()).toBe(true);
        expect(user.getField("enabled").isSet()).toBe(true);
        expect(user.getField("someValue").isSet()).toBe(true);

        expect(user.firstName).toBe("a");
        expect(user.lastName).toBe("b");
        expect(user.age).toBe(40);
        expect(user.enabled).toBe(true);
        expect(user.someValue).toBe("e");

        user.someValue = "e";
        expect(user.someValue).toBe("e-UPDATED");
    });
});
