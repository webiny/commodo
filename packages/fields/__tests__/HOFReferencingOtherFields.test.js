import { withFields, onGet, number } from "@commodo/fields";
import { withProps } from "repropose";
import { compose } from "ramda";

test(`mutual field access - should be able to reference fields that will be applied later, using getField`, async () => {
    const Model = compose(
        withFields({
            number: number()
        }),
        withFields(instance => ({
            numberX3_tryWithPassedInstance: onGet(() => {
                return instance.number * 3;
            })(number()),
            numberX3_tryWithGetField: onGet(() => {
                // Just return since it's undefined, this instance does not contain number as field.
                return instance.getField("number").getValue() * 3;
            })(number())
        })),
        withProps({
            numberX3_asFunction() {
                return this.number * 3;
            }
        })
    )();

    const model = new Model();
    model.number = 100;

    expect(model.numberX3_asFunction()).toBe(300);
    expect(model.numberX3_tryWithPassedInstance).toBe(300);
    expect(model.numberX3_tryWithGetField).toBe(300);
});
