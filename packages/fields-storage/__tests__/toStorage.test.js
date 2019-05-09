import User from "./resources/models/user";
import { withFields, string, fields } from "@commodo/fields";
import { withName } from "@commodo/name";
import { compose } from "ramda";
import { withProps } from "repropose";
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
                attr2: string()
            }),
            withProps({
                get attr3() {
                    return "attr3DynValue";
                }
            }),
            withName("C")
        )(Model);

        const B = compose(
            withProps({
                get attr3() {
                    return "attr3DynValue";
                }
            }),
            withFields({
                attr1: string(),
                attr2: string(),
                attr4: fields({ instanceOf: C }),
                attr5: fields({ instanceOf: C, list: true })
            }),
            withProps({
                get attr6() {
                    new C().populate({ attr1: "attr6DynValue" });
                },
                get attr7() {
                    return [
                        new C().populate({ attr1: "attr6DynValue" }),
                        new C().populate({ attr1: "attr6DynValue" })
                    ];
                }
            }),
            withName("B")
        )(Model);

        const A = compose(
            withProps({
                get attr3() {
                    return "attr3DynValue";
                }
            }),
            withFields({
                attr1: string(),
                attr2: string(),
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
