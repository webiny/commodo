import { withFields, WithFieldsError } from "@commodo/fields";
import { Collection } from "@commodo/fields-storage";
import { ref } from "@commodo/fields-storage-ref";
import { MainEntity, Entity1, Entity2 } from "../../resources/models/modelsAttributeModels";
import sinon from "sinon";
import mdbid from "mdbid";
import { compose } from "ramda";

const sandbox = sinon.createSandbox();

describe("attribute models test", () => {
    afterEach(() => sandbox.restore());

    const model = new MainEntity();

    test("should set empty Collection - attributes should accept array of models", async () => {
        let error;
        try {
            model.attribute1 = new Entity1();
            expect(await model.attribute1).toBeInstanceOf(Entity1);
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe(
            'Invalid data type: ref (list) field "attribute1" cannot accept value [object Object] (non-list).'
        );

        error = null;
        try {
            model.attribute2 = new Entity1();
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe(
            'Invalid data type: ref (list) field "attribute2" cannot accept value [object Object] (non-list).'
        );
    });

    test("should pass - empty arrays set", async () => {
        model.attribute1 = [];
        model.attribute2 = [];
        await model.validate();
    });

    test("should fail - arrays with empty plain objects set - nested validation must be triggered", async () => {
        model.attribute1 = [{}, {}];
        model.attribute2 = [{}, {}, {}];
        try {
            await model.validate();
        } catch (e) {
            const attr1 = e.data.invalidFields.attribute1;
            expect(attr1.data.length).toBe(2);
            expect(attr1.data[0].data.index).toEqual(0);
            expect(attr1.data[0].data.invalidFields.name.code).toEqual(
                WithFieldsError.VALIDATION_FAILED_INVALID_FIELD
            );
            expect(attr1.data[0].data.invalidFields.name.data).toEqual(null);
            expect(attr1.data[0].data.invalidFields.name.message).toEqual("Value is required.");
            expect(attr1.data[0].data.invalidFields.type).toBeUndefined();

            const attr2 = e.data.invalidFields.attribute2;
            expect(attr2.data.length).toBe(3);
            expect(attr2.data[0].data.index).toEqual(0);
            expect(attr2.data[1].data.index).toEqual(1);
            expect(attr2.data[2].data.index).toEqual(2);

            expect(attr2.data[0].data.invalidFields.firstName.code).toEqual(
                WithFieldsError.VALIDATION_FAILED_INVALID_FIELD
            );
            expect(attr2.data[0].data.invalidFields.lastName.code).toEqual(
                WithFieldsError.VALIDATION_FAILED_INVALID_FIELD
            );
            expect(attr2.data[0].data.invalidFields.enabled).toBeUndefined();

            return;
        }
        throw Error("Error should've been thrown.");
    });

    test("should pass - valid data sent", async () => {
        model.attribute1 = [
            { name: "Enlai", type: "dog" },
            { name: "Rocky", type: "dog" },
            { name: "Lina", type: "parrot" }
        ];
        model.attribute2 = [
            { firstName: "John", lastName: "Doe" },
            { firstName: "Jane", lastName: "Doe" }
        ];

        await model.validate();
    });

    test("should fail - all good except last item of attribute1", async () => {
        model.attribute1 = [
            { name: "Enlai", type: "dog" },
            { name: "Rocky", type: "dog" },
            { name: "Lina", type: "bird" }
        ];
        model.attribute2 = [
            { firstName: "John", lastName: "Doe" },
            { firstName: "Jane", lastName: "Doe" }
        ];

        try {
            await model.validate();
        } catch (e) {
            const attr1 = e.data.invalidFields.attribute1;
            expect(attr1.data.length).toBe(1);
            expect(attr1.data[0].data.index).toEqual(2);
            expect(attr1.data[0].data.invalidFields.type.code).toEqual(
                WithFieldsError.VALIDATION_FAILED_INVALID_FIELD
            );
            expect(attr1.data[0].data.invalidFields.type.data).toEqual(null);
            expect(attr1.data[0].data.invalidFields.type.message).toEqual(
                "Value must be one of the following: cat, dog, mouse, parrot."
            );
        }
    });

    test("should correctly validate instances in the attribute and throw errors appropriately", async () => {
        const mainEntity = new MainEntity();

        let error;
        try {
            mainEntity.attribute1 = [
                null,
                10,
                "A",
                { id: "B", name: "Enlai", type: "dog" },
                new Entity2().populate({
                    firstName: "Foo",
                    lastName: "bar"
                })
            ];
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe(
            'Invalid data type: ref field "attribute1" cannot accept value 10.'
        );

        const A = mdbid();
        const B = mdbid();
        const C = mdbid();

        mainEntity.attribute2 = [{ id: C, firstName: "John", lastName: "Doe" }];

        sandbox
            .stub(Entity2.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: A, name: "Bucky", type: "dog" };
            })
            .callsFake(() => {
                return { id: B, name: "Enlai", type: "dog" };
            })
            .onCall(2)
            .callsFake(() => {
                return { id: C, firstName: "Foo", lastName: "Bar" };
            });

        error = null;
        try {
            await mainEntity.getField("attribute1").validate();
        } catch (e) {
            error = e;
        }

        expect(error).toBe(null);

        await mainEntity.getField("attribute2").validate();

        mainEntity.attribute1 = null;
        await mainEntity.getField("attribute1").validate();
    });

    test("should validate if attribute is being loaded", async () => {
        const ids = {
            mainEntity: mdbid()
        };

        let findById = sandbox
            .stub(MainEntity.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: ids.mainEntity, name: "MainEntity" };
            });

        sandbox
            .stub(MainEntity.getStorageDriver(), "find")
            .onCall(0)
            .callsFake(() => {
                return [[{ id: ids.mainEntity, name: "MainEntity" }]];
            });

        const mainEntity = await MainEntity.findById(ids.mainEntity);

        await mainEntity.save();
        expect(mainEntity.getField("attribute1").state.loaded).toBe(false);
        expect(mainEntity.getField("attribute1").state.loading).toBe(false);

        expect(findById.callCount).toEqual(1);
        findById.restore();

        expect(mainEntity.getField("attribute1").state.loaded).toBe(false);
        expect(mainEntity.getField("attribute1").state.loading).toBe(false);

        mainEntity.attribute1 = [{ type: "test" }];

        await expect(mainEntity.save()).rejects.toThrow(WithFieldsError);
    });

    test("should validate on attribute level and recursively on model level", async () => {
        const ids = { mainEntity: mdbid() };

        let findById = sandbox
            .stub(MainEntity.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: ids.mainEntity, name: "MainEntity" };
            });

        const MainWithRequiredEntity = compose(
            withFields({
                requiredEntity: ref({
                    instanceOf: Entity1,
                    list: true,
                    validation: value => {
                        if (!value.length) {
                            throw Error("Value is required.");
                        }

                        if (value.length < 2) {
                            throw Error("Length must not be lower than 2.");
                        }
                    }
                })
            })
        )(MainEntity);

        const mainEntity = await MainWithRequiredEntity.findById(ids.mainEntity);
        findById.restore();

        let error = null;
        try {
            await mainEntity.validate();
        } catch (e) {
            error = e;
        }

        expect(error.data.invalidFields.requiredEntity.code).toEqual(
            "VALIDATION_FAILED_INVALID_FIELD"
        );
        expect(error.data.invalidFields.requiredEntity.data).toEqual(null);
        expect(error.data.invalidFields.requiredEntity.message).toEqual("Value is required.");

        mainEntity.requiredEntity = [{ name: "requiredEntity" }];

        error = null;
        try {
            await mainEntity.validate();
        } catch (e) {
            error = e;
        }

        expect(error.data.invalidFields.requiredEntity.code).toEqual(
            "VALIDATION_FAILED_INVALID_FIELD"
        );
        expect(error.data.invalidFields.requiredEntity.message).toEqual(
            "Length must not be lower than 2."
        );
    });

    test("if an instance of another Entity class was assigned in Collection, validation must fail", async () => {
        const model = new MainEntity();

        try {
            model.attribute1 = new Collection([new Entity1(), new Entity2()]);
        } catch (e) {
            expect(e.code).toBe("FIELD_DATA_TYPE_ERROR");
            expect(e.message).toBe(
                'Invalid data type: ref field "attribute1" cannot accept value [object Object].'
            );
            return;
        }

        throw Error(`Error should've been thrown.`);
    });

    test("should fail validating if not an Collection is assigned as value", async () => {
        const model = new MainEntity();
        let error;
        try {
            model.attribute1 = 123;
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe(
            'Invalid data type: ref (list) field "attribute1" cannot accept value 123 (non-list).'
        );
    });
});
