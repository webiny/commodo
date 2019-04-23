import { compose } from "ramda";
import { withFields, onSet, onGet, string, number, boolean, object, setOnce } from "@commodo/fields";

describe("field models test", () => {
    const Model1 = compose(
        withFields({
            name: string({
                validation: value => {
                    if (!value) {
                        throw Error("Where is the value?");
                    }
                }
            }),
            number: number(),
            type: string({
                validation: value => {
                    if (value && !["cat", "dog", "mouse", "parrot"].includes(value)) {
                        throw new Error("Type must be cat, dog, mouse or parrot.");
                    }
                }
            })
        })
    )(function() {});

    const Model2 = compose(
        withFields({
            firstName: string({
                validation: value => {
                    if (!value) {
                        throw new Error("First name not defined.");
                    }
                }
            }),
            lastName: string({
                validation: value => {
                    if (!value) {
                        throw new Error("Last name not defined.");
                    }
                }
            }),
            enabled: boolean()
        })
    )(function() {});

    const Model = compose(
        withFields({
            field1: object({ instanceOf: Model1, list: true }),
            field2: object({ instanceOf: Model2, list: true })
        })
    )(function() {});

    test("should pass - empty arrays set", async () => {
        const modelInstance = new Model();
        modelInstance.field1 = [];
        modelInstance.field2 = [];
        await modelInstance.validate();
    });

    test("should fail - arrays with empty plain objects set - nested validation must be triggered", async () => {
        const modelInstance = new Model();
        modelInstance.field1 = [{}, {}];
        modelInstance.field2 = [{}, {}, {}];

        try {
            await modelInstance.validate();
        } catch (e) {
            expect(e.data).toEqual({
                invalidFields: {
                    field1: {
                        code: "VALIDATION_FAILED_INVALID_FIELDS",
                        data: {
                            invalidFields: {
                                name: {
                                    code: "VALIDATION_FAILED_INVALID_FIELD",
                                    data: null,
                                    message: "Where is the value?"
                                }
                            }
                        },
                        message: "Validation failed."
                    },
                    field2: {
                        code: "VALIDATION_FAILED_INVALID_FIELDS",
                        data: {
                            invalidFields: {
                                firstName: {
                                    code: "VALIDATION_FAILED_INVALID_FIELD",
                                    data: null,
                                    message: "First name not defined."
                                },
                                lastName: {
                                    code: "VALIDATION_FAILED_INVALID_FIELD",
                                    data: null,
                                    message: "Last name not defined."
                                }
                            }
                        },
                        message: "Validation failed."
                    }
                }
            });
            return;
        }
        throw Error("Error should've been thrown.");
    });

    test("should pass - valid data sent", async () => {
        const modelInstance = new Model();

        modelInstance.field1 = [
            { name: "Enlai", type: "dog" },
            { name: "Rocky", type: "dog" },
            { name: "Lina", type: "parrot" }
        ];
        modelInstance.field2 = [
            { firstName: "John", lastName: "Doe" },
            { firstName: "Jane", lastName: "Doe" }
        ];
        await modelInstance.validate();
    });

    test("should fail - all good except last item of field1", async () => {
        const modelInstance = new Model();
        modelInstance.field1 = [
            { name: "Enlai", type: "dog" },
            { name: "Rocky", type: "dog" },
            { name: "Lina", type: "bird" }
        ];
        modelInstance.field2 = [
            { firstName: "John", lastName: "Doe" },
            { firstName: "Jane", lastName: "Doe" }
        ];

        try {
            await modelInstance.validate();
        } catch (e) {
            expect(e.data).toEqual({
                invalidFields: {
                    field1: {
                        code: "VALIDATION_FAILED_INVALID_FIELDS",
                        data: {
                            invalidFields: {
                                type: {
                                    code: "VALIDATION_FAILED_INVALID_FIELD",
                                    data: null,
                                    message: "Type must be cat, dog, mouse or parrot."
                                }
                            }
                        },
                        message: "Validation failed."
                    }
                }
            });
            return;
        }

        throw Error("Error should've been thrown.");
    });

    test("should fail on validation since an item is not an object of any type", async () => {
        try {
            const modelInstance = new Model();
            modelInstance.field1 = [
                { name: "Enlai", type: "dog" },
                { name: "Rocky", type: "dog" },
                123
            ];
        } catch (e) {
            expect(e.code).toBe("FIELD_DATA_TYPE_ERROR");
            expect(e.message).toBe(
                'Invalid data type: object field "field1" cannot accept value 123.'
            );
            return;
        }

        throw Error("Error should've been thrown.");
    });

    test("validation must be executed on both field and model level", async () => {
        const Model = compose(
            withFields({
                field1: object({
                    instanceOf: Model1,
                    list: true,
                    validation: value => {
                        if (!value || value.length < 2) {
                            throw Error("Minimum of two items is required.");
                        }
                    }
                })
            })
        )(function() {});

        const newModel = new Model();

        let error = null;
        try {
            await newModel.validate();
        } catch (e) {
            error = e;
        }

        expect(error.data).toEqual({
            invalidFields: {
                field1: {
                    code: "VALIDATION_FAILED_INVALID_FIELD",
                    data: null,
                    message: "Minimum of two items is required."
                }
            }
        });

        error = null;
        try {
            newModel.field1 = [{ name: "Enlai", type: "dog" }];
            await newModel.validate();
        } catch (e) {
            error = e;
        }

        expect(error.data).toEqual({
            invalidFields: {
                field1: {
                    code: "VALIDATION_FAILED_INVALID_FIELD",
                    data: null,
                    message: "Minimum of two items is required."
                }
            }
        });

        newModel.field1 = [{ name: "Enlai", type: "dog" }, { name: "Enlai", type: "dog" }];
        await newModel.validate();
    });

    test("should not set value if setOnce is enabled", async () => {
        const ModelWithSetOnce = compose(
            withFields({
                field1: compose(setOnce())(object({ list: true, instanceOf: Model1 }))
            })
        )(function() {});

        const newModel = new ModelWithSetOnce();

        newModel.field1 = [
            { name: "Enlai", type: "dog" },
            { name: "Rocky", type: "dog" },
            { name: "Lina", type: "bird" }
        ];

        newModel.field1 = null;

        expect(newModel.field1[0].name).toBe("Enlai");
        expect(newModel.field1[1].name).toBe("Rocky");
        expect(newModel.field1[2].name).toBe("Lina");
    });

    test("onSet/onGet must be triggered correctly", async () => {
        let applyOnGet = false;

        const Model = compose(
            withFields({
                someModels: compose(
                    onSet(value => {
                        const final = [];
                        value.forEach((value, index) => {
                            final.push({ name: "index-" + index });
                        });
                        return final;
                    }),
                    onGet(value => {
                        return applyOnGet ? "random" : value;
                    })
                )(object({ list: true, instanceOf: Model1 }))
            })
        )(function() {});

        const newModel = new Model();

        newModel.populate({
            someModels: [
                {
                    name: "Webiny LTD",
                    city: "London"
                },
                {
                    name: "Webiny LTD 2",
                    city: "London 2"
                }
            ]
        });

        expect(newModel.someModels[0].name).toEqual("index-0");
        expect(newModel.someModels[1].name).toEqual("index-1");

        applyOnGet = true;
        expect(newModel.someModels).toEqual("random");
    });
});
