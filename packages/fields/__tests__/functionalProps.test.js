import { withFields, number } from "@commodo/fields";
import { compose } from "ramda";

test(`should be possible to access current instance as first "withFields" argument`, async () => {
    const Model = compose(
        withFields(instance => {
            const newProps = {};
            if (!instance.getField("value2")) {
                newProps["value200"] = number();
            }

            if (!instance.getField("value3")) {
                newProps["value300"] = number();
            }

            return newProps;
        }),
        withFields({
            value1: number(),
            value2: number()
        })
    )();

    const model = new Model();
    expect(Object.keys(model.getFields())).toEqual(["value1", "value2", "value300"]);
});
