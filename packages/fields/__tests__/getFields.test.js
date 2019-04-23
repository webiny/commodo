import User from "./resources/models/User";
import { string, number, boolean } from "@commodo/fields/fields";
import { withFields } from "@commodo/fields";
import { compose } from "ramda";

test("should return all fields", async () => {
    const user = new User();

    const allFields = user.getFields();

    expect(Object.keys(allFields)).toEqual([
        "firstName",
        "lastName",
        "age",
        "enabled",
        "totalSomething"
    ]);

    expect(allFields["firstName"].type).toBe("string");
    expect(allFields["lastName"].type).toBe("string");
    expect(allFields["enabled"].type).toBe("boolean");
    expect(allFields["age"].type).toBe("number");
    expect(allFields["totalSomething"].type).toBe("number");
});

test(`must compose models with fields correctly`, async () => {
    const User = compose(
        withFields({
            firstName: string(),
            lastName: string(),
            email: string(),
            age: number(),
            enabled: boolean()
        })
    )(function() {});

    const user = new User();
    expect(Object.keys(user.getFields())).toEqual([
        "firstName",
        "lastName",
        "email",
        "age",
        "enabled"
    ]);

    user.email = "user@internet.com";

    const Admin = compose(withFields({ roles: string(), businessEmail: string() }))(User);

    const admin = new Admin();
    expect(Object.keys(admin.getFields())).toEqual([
        "firstName",
        "lastName",
        "email",
        "age",
        "enabled",
        "roles",
        "businessEmail"
    ]);

    admin.email = "admin@internet.com";

    expect(user.email).toBe("user@internet.com");
    expect(admin.email).toBe("admin@internet.com");
});
