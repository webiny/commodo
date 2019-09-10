import { withFields, number } from "@commodo/fields";
import { compose } from "ramda";

test(`make sure instances have only needed attributes, and previous instances aren't affected by the new one's fields`, async () => {
    const createModel1 = base =>
        compose(
            withFields({
                number2: number()
            }),
            withFields({
                number1: number()
            })
        )(base);

    const createModel2 = base =>
        compose(
            withFields({
                number4: number()
            }),
            withFields({
                number3: number()
            })
        )(base);

    const Model1 = createModel1();
    const Model2 = compose(
        createModel2,
        createModel1
    )();

    const model1 = new Model1();
    const model2 = new Model2();
    expect(Object.keys(model1.getFields())).toEqual(["number1", "number2"]);
    expect(Object.keys(model1.__withFields.fields)).toEqual(["number1", "number2"]);

    expect(Object.keys(model2.getFields())).toEqual(["number1", "number2", "number3", "number4"]);
    expect(Object.keys(model2.__withFields.fields)).toEqual([
        "number1",
        "number2",
        "number3",
        "number4"
    ]);
});
