import { withFields, onSet, number, boolean } from "@commodo/fields";
import { compose } from "ramda";

test(`should be possible to access other fields in onSet callback`, async () => {
    const Model = compose(
        withFields(instance => ({
            value: onSet(function(value) {
                return instance.x2Value ? value * 2 : value;
            })(number()),
            x2Value: boolean()
        }))
    )(function() {});

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
