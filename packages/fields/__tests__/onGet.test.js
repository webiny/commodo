import { withFields, onGet, number, boolean } from "@commodo/fields";
import { compose } from "ramda";

test(`should and should not be possible to access other fields in onGet callback (depending on order of applying)`, async () => {
    const Model = compose(
        withFields(instance => ({
            x4Value: onGet(() => {
                return instance.value * 4;
            })(number())
        })),
        withFields(instance => ({
            value: onGet(value => {
                return instance.x2Value ? value * 2 : value;
            })(number()),
            x2Value: boolean()
        })),
        withFields(instance => ({
            x3Value: onGet(() => {
                return instance.value * 3;
            })(number())
        }))
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

    expect(model.x4Value).toBe(3200);

    expect(model.x3Value).toBe(2400);
});
