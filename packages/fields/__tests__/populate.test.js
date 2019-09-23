import { string, number, boolean, fields } from "@commodo/fields/fields";
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

test(`calling populate on fields attribute should work correctly`, async () => {
    const Class1 = compose(
        withFields({
            nestedFields: fields({
                instanceOf: withFields({
                    age: number(),
                    name: string(),
                    slug: string()
                })()
            })
        })
    )();

    const instance1 = new Class1();
    expect(instance1.isDirty()).toBe(false);
    instance1.nestedFields = {};

    instance1.clean();

    expect(instance1.isDirty()).toBe(false);

    instance1.nestedFields.populate({
        age: 12,
        name: "name-test",
        slug: "slug-test"
    });

    expect(instance1.nestedFields.getField("age").state.dirty).toBe(true);
    expect(instance1.nestedFields.getField("name").state.dirty).toBe(true);
    expect(instance1.nestedFields.getField("slug").state.dirty).toBe(true);
    expect(instance1.isDirty()).toBe(true);

    instance1.clean();

    expect(instance1.isDirty()).toBe(false);

    const Class2 = compose(
        withFields({
            nestedFields: fields({
                list: true,
                instanceOf: withFields({
                    age: number(),
                    name: string(),
                    slug: string()
                })()
            })
        })
    )();

    const instance2 = new Class2();
    instance2.nestedFields = [];
    expect(instance2.isDirty()).toBe(true);

    instance2.clean();

    expect(instance2.isDirty()).toBe(false);

    instance2.nestedFields = [
        {
            age: 1,
            name: "name-test-1",
            slug: "slug-test-1"
        },
        {
            age: 2,
            name: "name-test-2",
            slug: "slug-test-2"
        },
        {
            age: 3,
            name: "name-test-3",
            slug: "slug-test-3"
        }
    ];

    expect(instance2.isDirty()).toBe(true);

    for (let i = 0; i < 2; i++) {
        expect(instance2.nestedFields[i].getField("age").isDirty()).toBe(true);
        expect(instance2.nestedFields[i].getField("name").isDirty()).toBe(true);
        expect(instance2.nestedFields[i].getField("slug").isDirty()).toBe(true);
    }

    instance2.clean();

    for (let i = 0; i < 2; i++) {
        expect(instance2.nestedFields[i].getField("age").isDirty()).toBe(false);
        expect(instance2.nestedFields[i].getField("name").isDirty()).toBe(false);
        expect(instance2.nestedFields[i].getField("slug").isDirty()).toBe(false);
    }

    expect(instance2.isDirty()).toBe(false);

    instance2.nestedFields[1].slug = "slug-test-33";

    expect(instance2.nestedFields[1].getField("slug").isDirty()).toBe(true);
    expect(instance2.isDirty()).toBe(true);
});
