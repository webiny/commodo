import { User, Company } from "../../resources/models/userCompanyImage";
import { withName } from "@commodo/name";
import Model from "../../resources/models/Model";
import { One, Two } from "../../resources/models/oneTwoThree";
import sinon from "sinon";
import { WithFieldsError, withFields, string } from "@commodo/fields";
import { ref } from "@commodo/fields-storage-ref";

import { compose } from "ramda";
const sandbox = sinon.createSandbox();

describe("model attribute test", () => {
    afterEach(() => sandbox.restore());
    beforeEach(() => User.getStoragePool().flush());

    test(`should fail because an invalid instance ("image" field) was set`, async () => {
        let error = null;
        const user = new User();
        user.firstName = "John";
        user.lastName = "Doe";

        // This won't immediately break because models are not created and populate on setValue.
        // This exact object will temporary be attribute's value, until getValue is called.
        // This is because if an ID was sent, we would need to load and populate, which is an async
        // operation. Also this way we don't load until it's really needed.
        // TODO: Maybe design a better logic here in the future?
        user.company = {
            name: "Company",
            image: new Company()
        };

        try {
            await user.validate();
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(WithFieldsError);
        expect(error.message).toBe(`Validation failed.`);
        expect(error.data).toEqual({
            invalidFields: {
                company: {
                    code: "FIELD_DATA_TYPE_ERROR",
                    data: null,
                    message:
                        'Invalid data type: ref field "image" cannot accept value [object Object].'
                }
            }
        });
    });

    test("should validate root and nested values ", async () => {
        const user = new User();
        user.populate({
            firstName: "John",
            lastName: "Doe",
            company: {
                image: {
                    size: 123.45
                }
            }
        });

        let error = null;
        try {
            await user.validate();
        } catch (e) {
            error = e;
        }

        expect(error.data).toEqual({
            invalidFields: {
                company: {
                    code: "VALIDATION_FAILED_INVALID_FIELDS",
                    data: {
                        invalidFields: {
                            image: {
                                code: "VALIDATION_FAILED_INVALID_FIELDS",
                                data: {
                                    invalidFields: {
                                        filename: {
                                            code: "VALIDATION_FAILED_INVALID_FIELD",
                                            data: null,
                                            message: "Value is required."
                                        }
                                    }
                                },
                                message: "Validation failed."
                            },
                            name: {
                                code: "VALIDATION_FAILED_INVALID_FIELD",
                                data: null,
                                message: "Value is required."
                            }
                        }
                    },
                    message: "Validation failed."
                }
            }
        });

        user.populate({
            company: {
                image: {
                    filename: "image.jpg"
                }
            }
        });

        error = null;
        try {
            await user.validate();
        } catch (e) {
            error = e;
        }

        expect(error.data).toEqual({
            invalidFields: {
                company: {
                    code: "VALIDATION_FAILED_INVALID_FIELDS",
                    data: {
                        invalidFields: {
                            name: {
                                code: "VALIDATION_FAILED_INVALID_FIELD",
                                data: null,
                                message: "Value is required."
                            }
                        }
                    },
                    message: "Validation failed."
                }
            }
        });

        user.populate({
            company: {
                name: "Company"
            }
        });

        error = null;
        try {
            await user.validate();
        } catch (e) {
            error = e;
        }

        expect(error).toBeNull();
    });

    test("should validate if attribute is being loaded", async () => {
        let findById = sandbox
            .stub(One.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: "one", name: "One" };
            });

        const one = await One.findById("one");

        await one.save();

        expect(one.getField("two").state.loaded).toBe(false);
        expect(one.getField("two").state.loading).toBe(false);
        expect(findById.callCount).toEqual(1);
        findById.restore();

        expect(one.getField("two").state.loaded).toBe(false);
        expect(one.getField("two").state.loading).toBe(false);
        one.two = "invalid-id";
        await expect(one.save()).rejects.toThrow(WithFieldsError);
        expect(one.getField("two").state.loaded).toBe(true);
        expect(one.getField("two").state.loading).toBe(false);
    });

    test("should validate on attribute level and recursively on model level", async () => {
        const Two = compose(
            withName("Two"),
            withFields({
                name: string()
            })
        )(Model);

        const One = compose(
            withName("One"),
            withFields({
                name: string(),
                requiredEntity: ref({
                    instanceOf: Two,
                    validation: value => {
                        if (!value) {
                            throw new Error("Value is required.");
                        }
                    }
                })
            })
        )(Model);

        let findById = sandbox
            .stub(One.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: "one", name: "One" };
            });

        const one = await One.findById("one");
        findById.restore();

        let error = null;
        try {
            await one.validate();
        } catch (e) {
            error = e;
        }

        expect(error.data).toEqual({
            invalidFields: {
                requiredEntity: {
                    code: "VALIDATION_FAILED_INVALID_FIELD",
                    data: null,
                    message: "Value is required."
                }
            }
        });

        one.requiredEntity = { name: "two" };
        await one.validate();
    });

    test("should throw error since invalid ID was set", async () => {
        let modelFindById = sandbox
            .stub(One.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: "one", name: "One", two: "two" };
            });

        const one = await One.findById("a");

        expect(modelFindById.callCount).toEqual(1);
        modelFindById.restore();

        one.two = "anotherTwo¡€#¢∞";

        let error = null;
        try {
            await one.validate();
        } catch (e) {
            error = e;
        }

        expect(error.data).toEqual({
            invalidFields: {
                two: {
                    code: "VALIDATION_FAILED_INVALID_FIELD",
                    data: null,
                    message:
                        "Validation failed, received string, expecting instance a valid reference."
                }
            }
        });

        modelFindById.restore();
    });
});
