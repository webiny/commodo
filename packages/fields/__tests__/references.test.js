import { withFields, number, string } from "@commodo/fields";
import { compose } from "ramda";

test(`fields are NOT carried by reference, which is certainly what we want to have`, async () => {
    // Each instantiated model will have it's own instances of fields.
    // Mutually they're not related in any way.

    const Model = compose(
        withFields({
            number: number() // This is a factory, not an actual instances of the field.
        }),
        withFields({
            string: string() // This is a factory, not an actual instances of the field.
        })
    )(function() {});

    const model1 = new Model();
    const model2 = new Model();

    model1.number = 123;
    model2.string = 'string';

    expect(model1.getField("number").current).toBe(123);
    expect(model2.getField("number").current).toBe(null);

    expect(model1.getField("string").current).toBe(null);
    expect(model2.getField("string").current).toBe('string');
});
