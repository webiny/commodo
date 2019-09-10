import { string } from "@commodo/fields/fields";
import { withFields } from "@commodo/fields";
import { compose } from "ramda";

test(`must throw validation errors where appropriate`, async () => {
    const User = compose(
        withFields({
            firstName: string({
                validation: firstName => {
                    if (!firstName || firstName.length > 6) {
                        throw Error("First name too long.");
                    }
                }
            }),
            tags: string({
                list: true,
                validation: tags => {
                    if (!tags || !tags.length) {
                        throw Error("Tags are required.");
                    }

                    if (tags.length > 6) {
                        throw Error("Cannot set more than six tags.");
                    }

                    for (let i = 0; i < tags.length; i++) {
                        let tag = tags[i];
                        if (tag.length > 6) {
                            throw Error("Tag must not be more than six characters long.");
                        }
                    }
                }
            })
        })
    )();

    const user = new User();

    let error = null;
    try {
        user.firstName = "1234567";
        await user.validate();
    } catch (e) {
        error = e;
    }

    expect(error.code).toBe("VALIDATION_FAILED_INVALID_FIELDS");
    expect(error.data).toEqual({
        invalidFields: {
            firstName: {
                code: "VALIDATION_FAILED_INVALID_FIELD",
                data: null,
                message: "First name too long."
            },
            tags: {
                code: "VALIDATION_FAILED_INVALID_FIELD",
                data: null,
                message: "Tags are required."
            }
        }
    });

    error = null;
    try {
        user.firstName = "123456";
        user.tags = ["1", "2", "3124567", "4", "5", "6", "7"];
        await user.validate();
    } catch (e) {
        error = e;
    }

    expect(error.code).toBe("VALIDATION_FAILED_INVALID_FIELDS");
    expect(error.data).toEqual({
        invalidFields: {
            tags: {
                code: "VALIDATION_FAILED_INVALID_FIELD",
                data: null,
                message: "Cannot set more than six tags."
            }
        }
    });

    error = null;
    try {
        user.firstName = "123456";
        user.tags = ["1", "2", "3124567", "4", "5", "6"];
        await user.validate();
    } catch (e) {
        error = e;
    }

    expect(error.code).toBe("VALIDATION_FAILED_INVALID_FIELDS");
    expect(error.data).toEqual({
        invalidFields: {
            tags: {
                code: "VALIDATION_FAILED_INVALID_FIELD",
                data: null,
                message: "Tag must not be more than six characters long."
            }
        }
    });

    user.firstName = "123456";
    user.tags = ["1", "2", "3", "4", "5", "6"];
    await user.validate();
});
