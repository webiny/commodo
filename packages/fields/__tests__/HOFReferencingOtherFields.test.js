import { withFields, onGet, number } from "@commodo/fields";
import { withProps } from "repropose";
import { compose } from "ramda";

/**
 * Different approaches:
 * 1. FAIL - "numberX3_tryWithPassedInstance": the problem is that "instance" is a reference to current function's instance, which does not have
 * "number" field assigned to it. There is no cure here for now.
 * 2. FAIL - "numberX3_tryWithGetField" : fails since "number" is not assigned to this instance yet.
 * 3. PASS - yes, because "this" is referencing the top applied layer, which now has access to everything.
 */
test(`mutual field access - should UNFORTUNATELY NOT (this is double check) be able to reference fields that will be applied later`, async () => {
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
                return instance.getField("number");
            })(number())
        })),
        withProps({
            numberX3_asFunction() {
                return this.number * 3;
            }
        })
    )(function() {});

    const model = new Model();
    model.number = 100;

    expect(model.numberX3_asFunction()).toBe(300);
    expect(model.numberX3_tryWithPassedInstance).toBe(NaN);
    expect(model.numberX3_tryWithGetField).toBe(undefined);
});
