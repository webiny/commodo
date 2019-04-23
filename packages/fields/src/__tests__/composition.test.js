import { string, number, boolean } from "@commodo/fields/fields";
import { withFields } from "@commodo/fields";
import { withProps } from "repropose";
import { compose } from "ramda";

test(`must compose models with fields correctly`, async () => {
    const User = compose(
        withFields({
            firstName: string(),
            lastName: string(),
            email: string(),
            age: string(),
            enabled: string()
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

test(`must carry get/set callbacks even over other HOFs`, async () => {
    const User = compose(
        withProps({ c: 3, d: 4 }),
        withFields({
            firstName: string(),
            lastName: string()
        }),
        withFields({
            email: string(),
            age: number(),
            enabled: boolean()
        }),
        withProps({ a: 1, b: 2 })
    )(function() {});

    const user = new User();

    expect(Object.keys(user.getFields())).toEqual([
        "email",
        "age",
        "enabled",
        "firstName",
        "lastName"
    ]);

    expect(Object.keys(user)).toEqual([
        "a",
        "b",
        "__withFields",
        "processing",
        "getFields",
        "getField",
        "populate",
        "validate",
        "clean",
        "isDirty",
        "c",
        "d"
    ]);

    expect(Object.keys(Object.getOwnPropertyDescriptors(user))).toEqual([
        "a",
        "b",
        "__withFields",
        "processing",
        "getFields",
        "getField",
        "populate",
        "validate",
        "clean",
        "isDirty",
        "email",
        "age",
        "enabled",
        "firstName",
        "lastName",
        "c",
        "d"
    ]);

    user.email = "user@internet.com";
    user.age = 123;
    user.enabled = true;
    user.firstName = "john";
    user.lastName = "doe";

    expect(user.email).toBe("user@internet.com");
    expect(user.age).toBe(123);
    expect(user.enabled).toBe(true);
    expect(user.firstName).toBe("john");
    expect(user.lastName).toBe("doe");

    expect(user.__withFields.email.current).toBe("user@internet.com");
    expect(user.__withFields.age.current).toBe(123);
    expect(user.__withFields.enabled.current).toBe(true);
    expect(user.__withFields.firstName.current).toBe("john");
    expect(user.__withFields.lastName.current).toBe("doe");
});
