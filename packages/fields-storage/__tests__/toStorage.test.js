import User from "./resources/models/User";
import { withFields, string, fields } from "@commodo/fields";
import { withName } from "@commodo/name";
import { compose } from "ramda";
import { withProps } from "repropose";
import createModel from "./resources/models/createModel";

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

    test("populating simple model directly should merge values, not overwrite", async () => {
        const SomeClass = compose(
            withFields({
                data: fields({
                    instanceOf: withFields({
                        name: string(),
                        slug: string(),
                        fields1: fields({
                            instanceOf: withFields({
                                field1A: string(),
                                field1B: string()
                            })()
                        }),
                        fields2: fields({
                            instanceOf: withFields({
                                field2A: string(),
                                field2B: string()
                            })()
                        })
                    })()
                })
            }),
            withName("SomeClass")
        )(createModel());

        const someInstance = new SomeClass();
        someInstance.data = {};
        someInstance.data.populate({
            name: "test-name-1",
            slug: "test-slug-1",
            fields1: {
                field1A: "test-field-1-A",
                field1B: "test-field-1-B"
            }
        });

        expect(someInstance.data.name).toBe("test-name-1");
        expect(someInstance.data.slug).toBe("test-slug-1");
        expect(someInstance.data.fields1.field1A).toBe("test-field-1-A");
        expect(someInstance.data.fields1.field1B).toBe("test-field-1-B");

        someInstance.data.populate({});

        expect(someInstance.data.name).toBe("test-name-1");
        expect(someInstance.data.slug).toBe("test-slug-1");
        expect(someInstance.data.fields1.field1A).toBe("test-field-1-A");
        expect(someInstance.data.fields1.field1B).toBe("test-field-1-B");

        let toStorage = await someInstance.toStorage();
        expect(toStorage).toEqual({
            data: {
                name: "test-name-1",
                slug: "test-slug-1",
                fields1: {
                    field1A: "test-field-1-A",
                    field1B: "test-field-1-B"
                },
                fields2: null
            }
        });

        someInstance.clean();

        someInstance.data.populate({
            fields2: {
                field2A: "test-field-2-A",
                field2B: "test-field-2-B"
            }
        });

        expect(someInstance.data.name).toBe("test-name-1");
        expect(someInstance.data.slug).toBe("test-slug-1");
        expect(someInstance.data.fields1.field1A).toBe("test-field-1-A");
        expect(someInstance.data.fields1.field1B).toBe("test-field-1-B");
        expect(someInstance.data.fields2.field2A).toBe("test-field-2-A");
        expect(someInstance.data.fields2.field2B).toBe("test-field-2-B");

        toStorage = await someInstance.toStorage();
        expect(toStorage).toEqual({
            data: {
                name: "test-name-1",
                slug: "test-slug-1",
                fields1: {
                    field1A: "test-field-1-A",
                    field1B: "test-field-1-B"
                },
                fields2: {
                    field2A: "test-field-2-A",
                    field2B: "test-field-2-B"
                }
            }
        });

        someInstance.clean();

        // Data sent is not merged, but assigned, meaning a new instance of assigned "instanceOf" will be created.
        // Should we create a new feature - populateMerge? That might be nice.
        someInstance.data.populate({
            fields2: {
                field2A: "test-field-2-A-123",
            }
        });

        expect(someInstance.data.fields2.field2A).toBe("test-field-2-A-123");
        expect(someInstance.data.fields2.field2B).toBe(null);

        toStorage = await someInstance.toStorage();
        expect(toStorage).toEqual({
            data: {
                name: "test-name-1",
                slug: "test-slug-1",
                fields1: {
                    field1A: "test-field-1-A",
                    field1B: "test-field-1-B"
                },
                fields2: {
                    field2A: "test-field-2-A-123",
                    field2B: null
                }
            }
        });
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
        )(createModel());

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
        )(createModel());

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
        )(createModel());

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
                id: null,
                attr1: "attr1",
                attr2: "attr2",
                attr4: { attr1: "attr1", attr2: "attr2", id: null },
                attr5: [
                    { attr1: "0.attr1", attr2: "0.attr2", id: null },
                    { attr1: "1.attr1", attr2: "1.attr2", id: null }
                ]
            }
        });
    });
});
