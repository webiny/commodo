import User from "./resources/models/user";
import { withFields, string, number, fields, onGet, readOnly } from "@commodo/fields";
import { withName } from "@commodo/name";
import { compose } from "ramda";
import Model from "./resources/models/Model";

describe("toStorage test", () => {
    test("should return the same values, except dynamic attribute", async () => {
        const user = new User();
        user.populate({
            firstName: "A",
            lastName: "B",
            age: 10,
            enabled: true
        });
        await user.validate();

        const data = await user.toStorage();

        expect(Object.keys(data)).toEqual(["firstName", "lastName", "age", "enabled"]);
        expect(data["firstName"]).toBe("A");
        expect(data["lastName"]).toBe("B");
        expect(data["age"]).toBe(10);
        expect(data["enabled"]).toBe(true);
    });

    test("should return the same values, except dynamic attribute (including nested models)", async () => {
        const C = compose(
            withFields({
                attr1: string(),
                attr2: string(),
                attr3: compose(
                    readOnly(),
                    onGet(() => "attr3DynValue")
                )(number())
            }),
            withName("C")
        )(Model);

        const B = compose(
            withFields({
                attr1: string(),
                attr2: string(),
                attr3: compose(
                    readOnly(),
                    onGet(() => "attr3DynValue")
                )(number()),
                attr4: fields({ instanceOf: C }),
                attr5: fields({ instanceOf: C, list: true }),
                attr6: compose(
                    readOnly(),
                    onGet(() => new C().populate({ attr1: "attr6DynValue" }))
                )(fields({ instanceOf: C })),
                attr7: compose(
                    readOnly(),
                    onGet(() => [
                        new C().populate({ attr1: "attr6DynValue" }),
                        new C().populate({ attr1: "attr6DynValue" })
                    ])
                )(fields({ instanceOf: C, list: true, readOnly: true }))
            }),
            withName("B")
        )(Model);

        const A = compose(
            withFields({
                attr1: string(),
                attr2: string(),
                attr3: compose(
                    readOnly(),
                    onGet(() => "attr3DynValue")
                )(number()),
                attr4: fields({ instanceOf: B })
            }),
            withName("A")
        )(Model);

        const a = new A();
        a.populate({
            attr1: "attr1",
            attr2: "attr2",
            attr3: 333,
            attr4: {
                attr1: "attr1",
                attr2: "attr2",
                attr3: 333,
                attr4: {
                    attr1: "attr1",
                    attr2: "attr2",
                    attr3: 333
                },
                attr5: [
                    { attr1: "0.attr1", attr2: "0.attr2", attr3: 333 },
                    { attr1: "1.attr1", attr2: "1.attr2", attr3: 333 }
                ],
                attr6: {
                    attr1: "attr1",
                    attr2: "attr2",
                    attr3: 333
                },
                attr7: [
                    { attr1: "0.attr1", attr2: "0.attr2", attr3: 333 },
                    { attr1: "1.attr1", attr2: "1.attr2", attr3: 333 }
                ]
            }
        });

        const data = await a.toStorage();
        expect(data).toEqual({
            attr1: "attr1",
            attr2: "attr2",
            attr4: {
                attr1: "attr1",
                attr2: "attr2",
                attr4: { attr1: "attr1", attr2: "attr2" },
                attr5: [
                    { attr1: "0.attr1", attr2: "0.attr2" },
                    { attr1: "1.attr1", attr2: "1.attr2" }
                ]
            }
        });
    });
});
