import { string } from "@commodo/fields/fields";
import { withFields, WithFieldsError } from "@commodo/fields";

import { compose } from "ramda";

const Model = compose(withFields({ exampleAttribute: string() }))();
describe("attribute string test", () => {
    test("should accept string values", () => {
        const model = new Model();

        model.exampleAttribute = "some string";
        expect(model.exampleAttribute).toEqual("some string");

        model.exampleAttribute = "some string 2";
        expect(model.exampleAttribute).toEqual("some string 2");

        model.exampleAttribute = null;
        expect(model.exampleAttribute).toEqual(null);

        model.exampleAttribute = undefined;
        expect(model.exampleAttribute).not.toBeDefined();
    });

    [123, 0, 0.5, {}, [], false].forEach(value => {
        test(`shouldn't accept ${typeof value}`, async () => {
            const model = new Model();

            let error = null;
            try {
                model.exampleAttribute = value;
            } catch (e) {
                error = e;
            }

            expect(error).toBeInstanceOf(WithFieldsError);
            expect(error.code).toEqual(WithFieldsError.FIELD_DATA_TYPE_ERROR);
        });
    });

    test("should be able to assign new values by concatenation", () => {
        const model = new Model();

        model.exampleAttribute = "this ";
        expect(model.exampleAttribute).toEqual("this ");

        model.exampleAttribute = "this " + "should ";
        expect(model.exampleAttribute).toEqual("this should ");

        model.exampleAttribute += "work";
        expect(model.exampleAttribute).toEqual("this should work");
    });
});
