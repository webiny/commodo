import { string, number, boolean } from "@commodo/fields/fields";
import { withFields } from "@commodo/fields";
import { withProps } from "repropose";
import { compose } from "ramda";

test(`new instances must be their own instances, must not be linked with previously created ones`, async () => {
    const User = compose(
        withFields({
            firstName: string(),
            lastName: string(),
            email: string(),
            age: string(),
            enabled: string()
        })
    )();

    const user1 = new User();
    user1.firstName = "firstName1";
    user1.lastName = "lastName1";

    const user2 = new User();
    user2.firstName = "firstName2";
    user2.lastName = "lastName2";

    const user3 = new User();
    user3.firstName = "firstName3";
    user3.lastName = "lastName3";

    expect(user1.firstName).toBe("firstName1");
    expect(user1.lastName).toBe("lastName1");
    expect(user2.firstName).toBe("firstName2");
    expect(user2.lastName).toBe("lastName2");
    expect(user3.firstName).toBe("firstName3");
    expect(user3.lastName).toBe("lastName3");
});
