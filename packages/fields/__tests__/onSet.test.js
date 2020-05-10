import { withFields, onSet, number, boolean } from "@commodo/fields";
import { compose } from "ramda";

describe("onSet function test", () => {
    test(`should be possible to access other fields in onSet callback`, async () => {
        const Model = compose(
            withFields(instance => ({
                value: onSet(function(value) {
                    return instance.x2Value ? value * 2 : value;
                })(number()),
                x2Value: boolean()
            }))
        )();

        const model = new Model();
        model.value = 100;
        expect(model.value).toBe(100);

        model.value = 200;
        expect(model.value).toBe(200);

        model.x2Value = true;
        expect(model.value).toBe(200);

        model.value = 200;
        expect(model.value).toBe(400);
    });

    test(`should not be able to provide async callbacks`, async () => {
        const Model = compose(
            withFields({
                value: onSet(async () => {})(number())
            })
        )();

        const model = new Model();
        let error;
        try {
            model.value = 100;
        } catch (e) {
            error = e;
        }
        expect(error.message).toBe(`A promise was returned from the "onSet" callback (applied on the "value" field). Provided callbacks cannot perform async operations.`);
    });
});
