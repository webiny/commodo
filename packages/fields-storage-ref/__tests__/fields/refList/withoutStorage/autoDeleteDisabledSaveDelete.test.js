import { MainEntity, Entity1 } from "../../../resources/models/modelsAttributeModels";
import sinon from "sinon";
import mdbid from "mdbid";
const sandbox = sinon.createSandbox();
import idGenerator from "@commodo/fields-storage/idGenerator";

describe("save and delete models attribute test", () => {
    afterEach(() => sandbox.restore());
    beforeEach(() => MainEntity.getStoragePool().flush());

    test("should recursively trigger validation and save all models if data is valid", async () => {
        const mainEntity = new MainEntity();
        mainEntity
            .getField("attribute1")
            .setAutoDelete(false)
            .setAutoSave(false);
        mainEntity
            .getField("attribute2")
            .setAutoDelete(false)
            .setAutoSave(false);

        mainEntity.attribute1 = [
            { id: null, name: "Enlai", type: "invalid", markedAsCannotDelete: true },
            new Entity1().populate({ id: null, name: "Bucky", type: "invalid" })
        ];

        mainEntity.attribute2 = [
            {
                id: null,
                firstName: "John",
                lastName: "Doe",
                markedAsCannotDelete: true,
                model1Entities: [
                    { id: null, name: "dd", type: "dog", markedAsCannotDelete: true },
                    { id: null, name: "ee", type: "dog", markedAsCannotDelete: true },
                    { id: null, name: "ff", type: "invalid", markedAsCannotDelete: false }
                ]
            },
            {
                id: null,
                firstName: "Jane",
                lastName: "Doe",
                markedAsCannotDelete: true,
                model1Entities: [
                    { id: null, name: "gg", type: "invalid", markedAsCannotDelete: true }
                ]
            }
        ];

        let error = null;
        try {
            // Validation still needs to be triggered, even though the auto-save is not enabled.
            await mainEntity.save();
        } catch (e) {
            error = e;
        }

        expect(error.data.invalidFields.attribute1.code).toEqual("VALIDATION_FAILED_INVALID_FIELD");
        expect(error.data.invalidFields.attribute1.data.length).toBe(2);

        let items = error.data.invalidFields.attribute1.data;
        expect(items[0].data.index).toEqual(0);
        expect(items[0].data.invalidFields.type.data).toEqual(null);
        expect(items[0].data.invalidFields.type.message).toEqual(
            "Value must be one of the following: cat, dog, mouse, parrot."
        );

        expect(items[1].data.index).toEqual(1);
        expect(items[1].data.invalidFields.type.data).toEqual(null);
        expect(items[1].data.invalidFields.type.message).toEqual(
            "Value must be one of the following: cat, dog, mouse, parrot."
        );

        const attr1 = await mainEntity.attribute1;
        attr1[0].type = "dog";
        attr1[1].type = "dog";

        error = null;
        try {
            await mainEntity.save();
        } catch (e) {
            error = e;
        }

        expect(error.data.invalidFields.attribute2.code).toEqual("VALIDATION_FAILED_INVALID_FIELD");
        expect(error.data.invalidFields.attribute2.data.length).toBe(2);

        items = error.data.invalidFields.attribute2.data;
        expect(items[0].data.index).toEqual(0);
        expect(items[0].data.invalidFields.model1Entities.data.length).toBe(1);
        expect(items[0].data.invalidFields.model1Entities.data[0]).toEqual({
            code: "VALIDATION_FAILED_INVALID_FIELDS",
            data: {
                index: 2,
                invalidFields: {
                    type: {
                        code: "VALIDATION_FAILED_INVALID_FIELD",
                        data: null,
                        message: "Value must be one of the following: cat, dog, mouse, parrot."
                    }
                }
            },
            message: "Validation failed."
        });

        expect(items[1].data.index).toEqual(1);
        expect(items[1].data.invalidFields.model1Entities.data.length).toBe(1);
        expect(items[1].data.invalidFields.model1Entities.data[0]).toEqual({
            code: "VALIDATION_FAILED_INVALID_FIELDS",
            data: {
                index: 0,
                invalidFields: {
                    type: {
                        code: "VALIDATION_FAILED_INVALID_FIELD",
                        data: null,
                        message: "Value must be one of the following: cat, dog, mouse, parrot."
                    }
                }
            },
            message: "Validation failed."
        });

        const attr2 = await mainEntity.attribute2;
        (await attr2[1].model1Entities)[0].type = "dog";

        error = null;
        try {
            await mainEntity.save();
        } catch (e) {
            error = e;
        }

        expect(error.data.invalidFields.attribute2.code).toEqual("VALIDATION_FAILED_INVALID_FIELD");
        expect(error.data.invalidFields.attribute2.data.length).toBe(1);

        items = error.data.invalidFields.attribute2.data;
        expect(items[0].data.index).toEqual(0);
        expect(items[0].data.invalidFields.model1Entities.data.length).toBe(1);
        expect(items[0].data.invalidFields.model1Entities.data[0]).toEqual({
            code: "VALIDATION_FAILED_INVALID_FIELDS",
            data: {
                index: 2,
                invalidFields: {
                    type: {
                        code: "VALIDATION_FAILED_INVALID_FIELD",
                        data: null,
                        message: "Value must be one of the following: cat, dog, mouse, parrot."
                    }
                }
            },
            message: "Validation failed."
        });

        (await attr2[0].model1Entities)[2].type = "dog";

        const AA = mdbid();
        let saveSpy = sandbox.spy(mainEntity.getStorageDriver(), "save");
        let generateIdStub = sandbox
            .stub(idGenerator, "generate")
            .onCall(0)
            .callsFake(() => AA);

        await mainEntity.save();

        expect(saveSpy.callCount).toEqual(1);

        expect(mainEntity.id).toEqual(AA);
        expect(attr1[0].id).toEqual(null);
        expect(attr1[1].id).toEqual(null);
        expect((await attr2[0].model1Entities)[0].id).toEqual(null);
        expect((await attr2[0].model1Entities)[1].id).toEqual(null);
        expect((await attr2[0].model1Entities)[2].id).toEqual(null);
        expect(attr2[0].id).toEqual(null);
        expect((await attr2[1].model1Entities)[0].id).toEqual(null);
        expect(attr2[1].id).toEqual(null);

        saveSpy.restore();
        generateIdStub.restore();
    });

    test("should save only attributes that were loaded", async () => {
        const mainEntity = new MainEntity();
        mainEntity.attribute1 = [
            { id: null, name: "Enlai", type: "dog", markedAsCannotDelete: false },
            new Entity1().populate({ id: null, name: "Bucky", type: "dog" })
        ];

        mainEntity
            .getField("attribute1")
            .setAutoDelete(false)
            .setAutoSave(false);
        mainEntity
            .getField("attribute2")
            .setAutoDelete(false)
            .setAutoSave(false);

        let saveSpy = sandbox.spy(mainEntity.getStorageDriver(), "save");

        let modelFind = sandbox.stub(mainEntity.getStorageDriver(), "find");

        await mainEntity.save();

        expect(saveSpy.callCount).toEqual(1);
        expect(modelFind.callCount).toEqual(0);

        saveSpy.restore();
        modelFind.restore();
    });

    test("auto delete must be automatically enabled and deletion must stop deletion if error was thrown", async () => {
        const mainEntity = new MainEntity();
        mainEntity.attribute1 = [
            { id: null, name: "Enlai", type: "dog", markedAsCannotDelete: true },
            new Entity1().populate({ id: null, name: "Bucky", type: "parrot" })
        ];

        mainEntity.attribute2 = [
            {
                id: null,
                firstName: "John",
                lastName: "Doe",
                markedAsCannotDelete: true,
                model1Entities: [
                    { id: null, name: "dd", type: "dog", markedAsCannotDelete: true },
                    { id: null, name: "ee", type: "dog", markedAsCannotDelete: true },
                    { id: null, name: "ff", type: "parrot", markedAsCannotDelete: false }
                ]
            },
            {
                id: null,
                firstName: "Jane",
                lastName: "Doe",
                markedAsCannotDelete: true,
                model1Entities: [{ id: null, name: "gg", type: "dog", markedAsCannotDelete: true }]
            }
        ];

        mainEntity
            .getField("attribute1")
            .setAutoDelete(false)
            .setAutoSave(false);
        mainEntity
            .getField("attribute2")
            .setAutoDelete(false)
            .setAutoSave(false);

        const AA = mdbid();

        let modelSave = sandbox
            .stub(mainEntity.getStorageDriver(), "save")
            .onCall(0)
            .callsFake(({ model }) => {
                model.id = AA;
                return true;
            });

        await mainEntity.save();

        expect(modelSave.callCount).toEqual(1);
        modelSave.restore();

        let modelDelete = sandbox.stub(mainEntity.getStorageDriver(), "delete");
        let error = null;
        try {
            await mainEntity.delete();
        } catch (e) {
            error = e;
        }

        expect(error).toBeNull();
        expect(modelDelete.calledOnce).toBeTruthy();

        const attr1 = await mainEntity.attribute1;
        attr1[0].markedAsCannotDelete = false;

        try {
            await mainEntity.delete();
        } catch (e) {
            error = e;
        }

        expect(error).toBeNull();
        expect(modelDelete.calledTwice).toBeTruthy();

        const attr2 = await mainEntity.attribute2;
        (await attr2[0].model1Entities)[0].markedAsCannotDelete = false;

        try {
            await mainEntity.delete();
        } catch (e) {
            error = e;
        }

        expect(error).toBeNull();
        expect(modelDelete.calledThrice).toBeTruthy();

        (await attr2[0].model1Entities)[1].markedAsCannotDelete = false;

        try {
            await mainEntity.delete();
        } catch (e) {
            error = e;
        }

        expect(error).toBeNull();
        expect(modelDelete.callCount).toEqual(4);

        attr2[0].markedAsCannotDelete = false;

        try {
            await mainEntity.delete();
        } catch (e) {
            error = e;
        }

        expect(error).toBeNull();
        expect(modelDelete.callCount).toEqual(5);

        (await attr2[1].model1Entities)[0].markedAsCannotDelete = false;

        try {
            await mainEntity.delete();
        } catch (e) {
            error = e;
        }

        expect(error).toBeNull();
        expect(modelDelete.callCount).toEqual(6);

        attr2[1].markedAsCannotDelete = false;

        await mainEntity.delete();
        expect(modelDelete.callCount).toEqual(7);
        modelDelete.restore();
    });

    test("should properly delete linked models even though they are not loaded", async () => {
        const A = mdbid();
        let modelFindById = sandbox.stub(MainEntity.getStorageDriver(), "findOne").callsFake(() => {
            return { id: A };
        });

        const mainEntity = await MainEntity.findById(A);
        mainEntity
            .getField("attribute1")
            .setAutoDelete(false)
            .setAutoSave(false);
        mainEntity
            .getField("attribute2")
            .setAutoDelete(false)
            .setAutoSave(false);

        modelFindById.restore();

        const B = mdbid();
        const C = mdbid();
        const D = mdbid();
        const E = mdbid();
        const F = mdbid();
        const G = mdbid();
        const H = mdbid();
        const I = mdbid();

        let modelFind = sandbox
            .stub(MainEntity.getStorageDriver(), "find")
            .onCall(0)
            .callsFake(() => {
                return [
                    [
                        { id: B, name: "b", type: "dog", markedAsCannotDelete: true },
                        { id: C, name: "c", type: "dog", markedAsCannotDelete: false }
                    ]
                ];
            })
            .onCall(1)
            .callsFake(() => {
                return [
                    [
                        {
                            id: D,
                            firstName: "John",
                            lastName: "Doe",
                            markedAsCannotDelete: true
                        },
                        {
                            id: E,
                            firstName: "Jane",
                            lastName: "Doe",
                            markedAsCannotDelete: false
                        }
                    ]
                ];
            })
            .onCall(2)
            .callsFake(() => {
                return [
                    [
                        { id: F, name: "f", type: "dog", markedAsCannotDelete: false },
                        { id: G, name: "g", type: "dog", markedAsCannotDelete: false },
                        { id: H, name: "h", type: "parrot", markedAsCannotDelete: false }
                    ]
                ];
            })
            .onCall(3)
            .callsFake(() => {
                return [[{ id: I, name: "i", type: "dog", markedAsCannotDelete: false }]];
            });

        let modelDelete = sandbox
            .stub(MainEntity.getStorageDriver(), "delete")
            .callsFake(() => true);

        let error = null;
        try {
            await mainEntity.delete();
        } catch (e) {
            error = e;
        }

        expect(mainEntity.getField("attribute1").state.loaded).toBe(false);
        expect(mainEntity.getField("attribute1").state.loading).toBe(false);

        // Must not be loaded.
        expect(mainEntity.getField("attribute1").current[0]).toEqual(undefined);
        expect(mainEntity.getField("attribute1").current[1]).toEqual(undefined);

        expect(mainEntity.getField("attribute2").state.loaded).toBe(false);
        expect(mainEntity.getField("attribute2").state.loading).toBe(false);

        expect(mainEntity.getField("attribute2").current.length).toBe(0);

        expect(error).toBeNull();
        expect(modelDelete.callCount).toEqual(1);
        expect(modelFind.callCount).toEqual(0);

        const attr1 = await mainEntity.attribute1;
        attr1[0].markedAsCannotDelete = false;

        expect(modelFind.callCount).toEqual(1);

        error = null;
        try {
            await mainEntity.delete();
        } catch (e) {
            error = e;
        }

        expect(mainEntity.getField("attribute1").state.loaded).toBe(true);
        expect(mainEntity.getField("attribute1").state.loading).toBe(false);

        expect(mainEntity.getField("attribute1").current[0].id).toEqual(B);
        expect(mainEntity.getField("attribute1").current[1].id).toEqual(C);

        expect(mainEntity.getField("attribute2").state.loaded).toBe(false);
        expect(mainEntity.getField("attribute2").state.loading).toBe(false);

        expect(mainEntity.getField("attribute2").current[0]).toEqual(undefined);
        expect(mainEntity.getField("attribute2").current[1]).toEqual(undefined);

        expect(error).toBeNull();
        expect(modelDelete.callCount).toEqual(2);
        expect(modelFind.callCount).toEqual(1);

        const attr2 = await mainEntity.attribute2;
        attr2[0].markedAsCannotDelete = false;

        error = null;
        try {
            await mainEntity.delete();
        } catch (e) {
            error = e;
        }

        expect(error).toBeNull();

        expect(modelFind.callCount).toEqual(2);
        expect(modelDelete.callCount).toEqual(3);

        modelFind.restore();
        modelDelete.restore();
    });
});
