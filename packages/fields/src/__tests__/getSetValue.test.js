import { string, number, boolean } from "@commodo/fields/fields";
import { withFields } from "@commodo/fields";
import { compose } from "ramda";

test(`must set value into private __withFields property correctly`, async () => {
    const User = compose(
        withFields({
            firstName: string({ name: "firstName" }),
            lastName: string({ name: "lastName" }),
            email: string({ name: "email" }),
            age: number({ name: "age" }),
            enabled: boolean({ name: "enabled" })
        })
    )(function() {});

    const user = new User();
    user.firstName = "John";
    user.age = 32;

    expect(user.age).toBe(32);
    expect(user.firstName).toBe("John");
});
