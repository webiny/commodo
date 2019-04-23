import { WithFieldsError } from "@commodo/fields";
import { User, Company } from "./resources/models/userCompanyImage";

describe("entity nested validation test", () => {
    test("should fail because we have an invalid instance", async () => {
        const user = new User();

        user.firstName = "John";
        user.lastName = "Doe";
        user.company = {
            name: "Company",
            image: new Company()
        };

        let error = null;
        try {
            await user.save();
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(WithFieldsError);
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

    test("should fail because nested data is missing", async () => {
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
            await user.save();
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
    });
});
