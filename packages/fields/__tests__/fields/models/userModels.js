import { withFields, number, string, boolean, fields } from "@commodo/fields";
import { compose } from "ramda";

const noop = function() {};

export const Size = compose(
    withFields({
        height: number({
            validation(value) {
                if (!value) {
                    throw new Error("Height missing");
                }
            }
        }),
        width: number()
    })
)(noop);

export const Image = compose(
    withFields({
        file: string(),
        size: fields({ instanceOf: Size }),
        visible: boolean({ defaultValue: false })
    })
)(noop);

export const Company = compose(
    withFields({
        name: string({
            validation(value) {
                if (!value) {
                    throw new Error("Name missing.");
                }
            }
        }),
        image: fields({
            instanceOf: Image,
            validation(value) {
                if (!value) {
                    throw new Error("Image missing.");
                }
            }
        }),
        city: string({
            onGet: (value, lowerCase) => {
                if (lowerCase && value) {
                    return value.toLowerCase();
                }
                return value;
            }
        })
    })
)(noop);

export const User = compose(
    withFields({
        firstName: string(),
        lastName: string(),
        age: number({
            onGet: (value, operation, number) => {
                if (operation === "add") {
                    return value + Number(number);
                }

                if (operation === "sub") {
                    return value - Number(number);
                }

                return value;
            }
        }),
        company: fields({
            instanceOf: Company,
            validation(value) {
                if (!value) {
                    throw new Error("Where is the company?");
                }
            }
        })
    })
)(noop);
