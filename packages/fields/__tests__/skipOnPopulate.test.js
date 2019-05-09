import { string } from "@commodo/fields/fields";
import { withFields, skipOnPopulate } from "@commodo/fields";
import { compose } from "ramda";

test(`must not populate e-mail (only set value on direct assigns)`, async () => {
    const User = compose(
        withFields({
            firstName: string(),
            lastName: string(),
            email: compose(skipOnPopulate())(string({ skipOnPopulate: true }))
        })
    )(function() {});

    const user = new User();
    user.populate({
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com"
    });

    expect(user.firstName).toBe("John");
    expect(user.lastName).toBe("Doe");
    expect(user.email).toBe(null);

    user.firstName = "John-2";
    user.lastName = "Doe-2";
    user.email = "johndoe@gmail.com-2";

    expect(user.firstName).toBe("John-2");
    expect(user.lastName).toBe("Doe-2");
    expect(user.email).toBe("johndoe@gmail.com-2");

    user.populate({
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com"
    });

    expect(user.firstName).toBe("John");
    expect(user.lastName).toBe("Doe");
    expect(user.email).toBe("johndoe@gmail.com-2");
});
