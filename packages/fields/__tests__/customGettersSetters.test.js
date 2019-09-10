import { withFields, number, boolean } from "@commodo/fields";
import { withProps } from "repropose";
import { compose } from "ramda";

describe("custom getters / setters test", () => {
    test("custom getters using withProps", async () => {
        const Model = compose(
            withProps({
                get x4Value() {
                    return this.value * 4;
                }
            }),
            withFields({
                value: number()
            }),
            withProps({
                get x3Value() {
                    return this.value * 3;
                }
            })
        )();

        const model = new Model();
        model.value = 100;
        expect(model.value).toBe(100);

        model.value = 200;
        expect(model.value).toBe(200);

        // Check onGet applied on first and last "withFields" calls
        expect(model.x4Value).toBe(800);

        // The problem here is that recevied instance reference doesn't have value field assigned yet.
        expect(model.x3Value).toBe(600);
    });

    test(`custom getters using "get" field factory option`, async () => {
        const Model = compose(
            withFields({
                x4Value: number({
                    get() {
                        return this.value * 4;
                    }
                })
            }),
            withFields({
                value: number({
                    get(field) {
                        const value = field.getValue();
                        return this.x2Value ? value * 2 : value;
                    }
                }),
                valueWithSetter: number({
                    set(field, value) {
                        field.setValue(value + this.x4Value + this.value + this.x3Value + 100);
                    }
                }),
                x2Value: boolean()
            }),
            withFields({
                x3Value: number({
                    get() {
                        return this.value * 3;
                    }
                })
            })
        )();

        const model = new Model();
        model.value = 100;
        expect(model.value).toBe(100);

        model.value = 200;
        expect(model.value).toBe(200);

        model.x2Value = true;
        expect(model.value).toBe(400);

        model.value = 400;
        expect(model.value).toBe(800);

        // Check onGet applied on first and last "withFields" calls
        expect(model.x4Value).toBe(3200);

        // The problem here is that recevied instance reference doesn't have value field assigned yet.
        expect(model.x3Value).toBe(2400);

        // Test if setter is working.
        model.valueWithSetter = 5;
        expect(model.valueWithSetter).toBe(6505);
    });
});
