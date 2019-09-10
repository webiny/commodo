import { string } from "@commodo/fields/fields";
import { withFields, WithFieldsError } from "@commodo/fields";

import { compose } from "ramda";

const Model = compose(withFields({ attribute: string({ list: true }) }))();

test("should accept string values", () => {
    const model = new Model();

    model.attribute = ["some string"];
    expect(model.attribute).toEqual(["some string"]);

    model.attribute = ["some string 2"];
    expect(model.attribute).toEqual(["some string 2"]);

    model.attribute = [null];
    expect(model.attribute).toEqual([null]);

    model.attribute = [undefined];
    expect(model.attribute).toEqual([undefined]);
});

[[123], [0], [0.5], [{}], [[]], [false]].forEach(value => {
    test(`string field shouldn't accept array ${typeof value[0]}s`, async () => {
        const model = new Model();

        let error = null;
        try {
            model.attribute = value;
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(WithFieldsError);
        expect(error.code).toEqual(WithFieldsError.FIELD_DATA_TYPE_ERROR);
    });
});
