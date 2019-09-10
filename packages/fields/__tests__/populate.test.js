import { string, number, boolean } from "@commodo/fields/fields";
import { withFields } from "@commodo/fields";
import { compose } from "ramda";

test(`must populate fields correctly`, async () => {
    const User = compose(
        withFields({
            firstName: string(),
            lastName: string(),
            email: string(),
            age: number(),
            enabled: boolean(),
            deleted: boolean()
        })
    )();

    const user = new User();
    user.populate({
        firstName: "John",
        lastName: "Doe",
        email: "john@internet.com",
        age: 20,
        enabled: true,
        deleted: false
    });

    expect(user.firstName).toBe("John");
    expect(user.lastName).toBe("Doe");
    expect(user.email).toBe("john@internet.com");
    expect(user.age).toBe(20);
    expect(user.enabled).toBe(true);
    expect(user.deleted).toBe(false);
});
