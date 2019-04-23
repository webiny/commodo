import { number } from "@commodo/fields/fields";
import { withFields } from "@commodo/fields";
import { withProps } from "repropose";
import { compose } from "ramda";

test(`must be able to attach fields and also custom methods to achieve dynamic fields - complex example`, async () => {
    const Model = compose(
        withProps(props => {
            return {
                ...props,
                getNumber1() {
                    return props.number1;
                },
                getNumber2() {
                    return props.number2;
                }
            };
        }),
        withProps(props => {
            return {
                ...props,
                sum() {
                    return this.number1 + this.number2;
                }
            };
        }),
        withFields({
            number1: number({ name: "number1" }),
            number2: number({ name: "number2" })
        }),
        withProps(props => {
            return {
                ...props,
                remainder() {
                    return this.number2 - this.number1;
                }
            };
        }),
        withProps(props => {
            return {
                ...props,
                __getNumber1() {
                    return this.number1;
                },
                __getNumber2() {
                    return this.number2;
                }
            };
        })
    )(function() {});

    const model = new Model();
    model.number1 = 5;
    model.number2 = 8;

    expect(model.number1).toBe(5);
    expect(model.number2).toBe(8);
    expect(model.sum()).toBe(13);
    expect(model.remainder()).toBe(3);

    expect(model.__getNumber1()).toBe(5);
    expect(model.__getNumber2()).toBe(8);

    expect(model.getNumber1()).toBe(5);
    expect(model.getNumber2()).toBe(8);
});
