import { string, number, boolean, model, list } from "@commodo/fields/fields";
import { withFields, setOnce } from "@commodo/fields";
import { compose } from "ramda";

test(`must not allow changing of e-mail attribute (can be set only once)`, async () => {
    const User = compose(
        withFields({
            firstName: string(),
            lastName: string(),
            email: compose(setOnce())(string({ skipOnPopulate: true }))
        })
    )();

    const user = new User();
    user.firstName = "John";
    user.lastName = "Doe";
    user.email = "johndoe@gmail.com";

    expect(user.firstName).toBe("John");
    expect(user.lastName).toBe("Doe");
    expect(user.email).toBe("johndoe@gmail.com");

    user.firstName = "John-2";
    user.lastName = "Doe-2";
    user.email = "johndoe@gmail.com-2";

    expect(user.firstName).toBe("John-2");
    expect(user.lastName).toBe("Doe-2");
    expect(user.email).toBe("johndoe@gmail.com");
});
