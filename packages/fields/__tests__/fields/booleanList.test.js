import { boolean } from "@commodo/fields/fields";
import { withFields, WithFieldsError } from "@commodo/fields";
import { compose } from "ramda";

const Model = compose(withFields({ attribute: boolean({ list: true }) }))(function() {});

test("boolean field should accept boolean values (list)", () => {
    const model = new Model();
    model.attribute = [false];

    expect(model.attribute).toEqual([false]);

    model.attribute = [true];
    expect(model.attribute).toEqual([true]);

    model.attribute = [null];
    expect(model.attribute).toEqual([null]);

    model.attribute = [undefined];
    expect(model.attribute).toEqual([undefined]);
});

[[1000], [0], [0.5], [{}], [[]], ["some string"]].forEach(value => {
    test(`boolean field shouldn't accept array of ${typeof value[0]}s`, async () => {
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
