import { compose } from "ramda";
import { withFields, string, number, boolean, fields } from "@commodo/fields";

describe("toJSON test", () => {
    test("should return JSON data correctly", async () => {
        const Model = compose(
            withFields({
                firstName: string(),
                lastName: string(),
                number: number(),
                boolean: boolean(),
                fields: fields({
                    instanceOf: withFields({
                        firstName: string(),
                        lastName: string(),
                        number: number(),
                        boolean: boolean()
                    })()
                }),
                fieldsList: fields({
                    list: true,
                    instanceOf: withFields({
                        one: number(),
                        two: number()
                    })()
                })
            })
        )();

        const model = new Model();

        model.populate({
            firstName: "a",
            lastName: "b",
            number: 1,
            boolean: true,
            fields: {
                firstName: "f-a",
                lastName: "f-b",
                number: 2,
                boolean: false
            },
            fieldsList: [
                { one: 1, two: 2 },
                { one: 11, two: 22 }
            ]
        });

        expect(await model.toJSON()).toEqual({
            boolean: true,
            fields: {
                boolean: false,
                firstName: "f-a",
                lastName: "f-b",
                number: 2
            },
            fieldsList: [
                {
                    one: 1,
                    two: 2
                },
                {
                    one: 11,
                    two: 22
                }
            ],
            firstName: "a",
            lastName: "b",
            number: 1
        });

        expect(await model.toJSON({ onlyDirty: true })).toEqual({
            boolean: true,
            fields: {
                boolean: false,
                firstName: "f-a",
                lastName: "f-b",
                number: 2
            },
            fieldsList: [
                {
                    one: 1,
                    two: 2
                },
                {
                    one: 11,
                    two: 22
                }
            ],
            firstName: "a",
            lastName: "b",
            number: 1
        });

        expect(await model.toJSON({ onlyClean: true })).toEqual({});

        await model.clean();

        expect(await model.toJSON({ onlyDirty: true })).toEqual({});
        expect(await model.toJSON({ onlyClean: true })).toEqual({
            boolean: true,
            fields: {
                boolean: false,
                firstName: "f-a",
                lastName: "f-b",
                number: 2
            },
            fieldsList: [
                {
                    one: 1,
                    two: 2
                },
                {
                    one: 11,
                    two: 22
                }
            ],
            firstName: "a",
            lastName: "b",
            number: 1
        });
    });

    test(`if "undefined" was passed as populate value, toJSON should not return it as dirty`, async () => {
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
            firstName: undefined,
            lastName: undefined,
            age: 123
        });

        const data = await user.toJSON({ onlyDirty: true });
        expect(data).toEqual({ age: 123 });
    });
});
