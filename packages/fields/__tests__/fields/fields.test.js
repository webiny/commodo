import { User, Company } from "./models/userModels";
import { compose } from "ramda";
import { withFields, fields, WithFieldsError, setOnce, onSet, onGet } from "@commodo/fields";

describe("field object test", () => {
    describe("accepting correct Model classes test", () => {
        const Model1 = withFields()();
        const Model2 = withFields()();
        const InvalidModel = function() {};

        const Model = compose(
            withFields({
                field1: fields({ instanceOf: Model1 }),
                field2: fields({ instanceOf: Model2 }),
                invalidField: fields({ instanceOf: InvalidModel })
            })
        )();

        const testModel = new Model();

        test("field1 should accept Model1", async () => {
            testModel.field1 = new Model1();
            expect(testModel.field1).toBeInstanceOf(Model1);
        });

        test("field2 should accept Model2", async () => {
            testModel.field2 = new Model2();
            expect(typeof testModel.field2).toBe("object");
            expect(testModel.field2).toBeInstanceOf(Model2);
        });

        test("field1 shouldn't accept Model2", async () => {
            let error = null;
            try {
                testModel.field1 = new Model2();
            } catch (e) {
                error = e;
            }

            expect(error.message).toBe(
                `Invalid data type: fields field "field1" cannot accept value [object Object].`
            );
        });

        test("field2 shouldn't accept Model1", async () => {
            let error = null;
            try {
                testModel.field2 = new Model1();
            } catch (e) {
                error = e;
            }
            expect(error.message).toBe(
                `Invalid data type: fields field "field2" cannot accept value [object Object].`
            );
        });

        test("field must throw an error if set object does not have populate method", async () => {
            let error = null;
            try {
                testModel.invalidField = new InvalidModel();
            } catch (e) {
                error = e;
            }

            expect(error).toBeInstanceOf(WithFieldsError);
            expect(error.code).toEqual(WithFieldsError.MODEL_POPULATE_MISSING);
        });
    });

    describe("setting nested values to object and all nested objects test", () => {
        test("should correctly populate", async () => {
            const user = new User();

            user.populate({
                firstName: "John",
                lastName: "Doe",
                age: 15,
                company: {
                    name: "Webiny LTD",
                    city: "London",
                    image: {
                        file: "webiny.jpg",
                        size: { width: 12.5, height: 44 },
                        visible: false
                    }
                }
            });

            expect(user.firstName).toEqual("John");
            expect(user.lastName).toEqual("Doe");
            expect(user.age).toEqual(15);
            expect(user.company.name).toEqual("Webiny LTD");
            expect(user.company.city).toEqual("London");

            expect(user.company.image.file).toEqual("webiny.jpg");
            expect(user.company.image.visible).toEqual(false);
            expect(user.company.image.size.width).toEqual(12.5);
            expect(user.company.image.size.height).toEqual(44);
        });

        test("should trigger validation error on image size (missing height)", async () => {
            const user = new User();

            let error,
                validator = null;
            try {
                user.populate({
                    firstName: "John",
                    lastName: "Doe",
                    age: 15,
                    company: {
                        name: "Webiny LTD",
                        city: "London",
                        image: {
                            file: "webiny.jpg",
                            size: { width: 12.5 },
                            visible: false
                        }
                    }
                });
                await user.validate();
            } catch (e) {
                error = e;
                validator =
                    e.data.invalidFields.company.data.invalidFields.image.data.invalidFields.size
                        .data.invalidFields.height;
            }

            expect(error).toBeInstanceOf(WithFieldsError);
            expect(validator.code).toEqual(WithFieldsError.VALIDATION_FAILED_INVALID_FIELD);
            expect(validator.message).toEqual("Height missing");
        });
    });

    test("validation must be execute on both field and object level", async () => {
        const user = new User();

        let error = null;
        try {
            user.populate({
                firstName: "John",
                lastName: "Doe"
            });
            await user.validate();
        } catch (e) {
            error = e;
        }

        // {"invalidFields": {"company": {"code": "VALIDATION_FAILED_INVALID_FIELD", "data": null, "message": "Cannot read property 'validate' of null"}}}

        expect(error).toBeInstanceOf(WithFieldsError);
        expect(error.data).toEqual({
            invalidFields: {
                company: {
                    code: "VALIDATION_FAILED_INVALID_FIELD",
                    data: null,
                    message: "Where is the company?"
                }
            }
        });

        error = null;
        try {
            user.populate({
                firstName: "John",
                lastName: "Doe",
                company: {}
            });
            await user.validate();
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(WithFieldsError);
        expect(error.data).toEqual({
            invalidFields: {
                company: {
                    code: "VALIDATION_FAILED_INVALID_FIELDS",
                    data: {
                        invalidFields: {
                            image: {
                                code: "VALIDATION_FAILED_INVALID_FIELD",
                                data: null,
                                message: "Image missing."
                            },
                            name: {
                                code: "VALIDATION_FAILED_INVALID_FIELD",
                                data: null,
                                message: "Name missing."
                            }
                        }
                    },
                    message: "Validation failed."
                }
            }
        });
    });

    test("getting values out of object test", async () => {
        const user = new User();
        user.populate({
            company: {
                name: "Webiny LTD",
                city: "London",
                image: {
                    file: "webiny.jpg",
                    size: { width: 12.5, height: 44 },
                    visible: false
                }
            }
        });

        // when accessed directly, it should return a plain object with data
        await expect(typeof user.company).toBe("object");
        await expect(typeof user.company.image).toBe("object");
        await expect(typeof user.company.image.size).toBe("object");

        // when accessing nested key directly, it should return its value
        await expect(user.company.name).toEqual("Webiny LTD");
        await expect(user.company.image.file).toEqual("webiny.jpg");
        await expect(user.company.image.size.width).toEqual(12.5);
    });

    test("should not set value if setOnce is enabled", async () => {
        const UserWithSetOnce = compose(
            withFields({
                company: compose(setOnce())(
                    fields({
                        instanceOf: Company,
                        validation(value) {
                            if (!value) {
                                throw new Error("Where is the company?");
                            }
                        }
                    })
                )
            })
        )();

        const user = new UserWithSetOnce();
        user.populate({
            company: {
                name: "Webiny LTD",
                city: "London",
                image: {
                    file: "webiny.jpg",
                    size: { width: 12.5, height: 44 },
                    visible: false
                }
            }
        });

        user.company = null;

        expect(user.company.image.size.width).toEqual(12.5);
    });

    test("onSet/onGet must be triggered correctly", async () => {
        const UserWithOnSetOnSet = compose(
            withFields({
                company: compose(
                    onSet(() => ({ name: "onSet Name Value", city: "onSet City Value" }))
                )(
                    fields({
                        instanceOf: Company
                    })
                )
            })
        )();

        let user = new UserWithOnSetOnSet();
        user.populate({
            company: {
                name: "Webiny LTD",
                city: "London"
            }
        });

        expect(user.company.name).toEqual("onSet Name Value");
        expect(user.company.city).toEqual("onSet City Value");

        const UserWithOnGetOnSet = compose(
            withFields({
                company: compose(onGet(() => ({ random: "Something overridden randomly." })))(
                    fields({
                        instanceOf: Company
                    })
                )
            })
        )();

        user = new UserWithOnGetOnSet();
        user.populate({
            company: {
                name: "Webiny LTD",
                city: "London"
            }
        });

        expect(user.company).toEqual({
            random: "Something overridden randomly."
        });
    });
});
