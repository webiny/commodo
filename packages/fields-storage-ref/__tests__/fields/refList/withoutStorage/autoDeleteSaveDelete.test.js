import { MainEntity, Entity1 } from "../../../resources/models/modelsAttributeModels";
import sinon from "sinon";
import mdbid from "mdbid";
import idGenerator from "@commodo/fields-storage/idGenerator";

const sandbox = sinon.createSandbox();

describe("save and delete models attribute test", () => {
    afterEach(() => sandbox.restore());
    beforeEach(() => MainEntity.getStoragePool().flush());

    test("should recursively trigger validation and save all models if data is valid", async () => {
        const mainEntity = new MainEntity();
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
                    { id: null, name: "ee", type: "dog", markedAsCannotDelete: true },
                    { id: null, name: "ff", type: "dog", markedAsCannotDelete: true },
                    { id: null, name: "gg", type: "invalid", markedAsCannotDelete: false }
                ]
            },
            {
                id: null,
                firstName: "Jane",
                lastName: "Doe",
                markedAsCannotDelete: true,
                model1Entities: [
                    { id: null, name: "ii", type: "invalid", markedAsCannotDelete: true }
                ]
            }
        ];

        let error = null;
        try {
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
        const BB = mdbid();
        const CC = mdbid();
        const DD = mdbid();
        const EE = mdbid();
        const FF = mdbid();
        const GG = mdbid();
        const HH = mdbid();
        const II = mdbid();

        let createSpy = sandbox.spy(mainEntity.getStorageDriver(), "create");
        let generateIdStub = sandbox
            .stub(idGenerator, "generate")
            .onCall(1)
            .callsFake(() => BB)
            .onCall(2)
            .callsFake(() => CC)
            .onCall(3)
            .callsFake(() => DD)
            .onCall(4)
            .callsFake(() => EE)
            .onCall(5)
            .callsFake(() => FF)
            .onCall(6)
            .callsFake(() => GG)
            .onCall(7)
            .callsFake(() => HH)
            .onCall(8)
            .callsFake(() => II)
            .onCall(0)
            .callsFake(() => AA);

        await mainEntity.save();

        expect(createSpy.callCount).toEqual(9);

        expect(mainEntity.id).toBe(AA);
        expect(attr1[0].id).toBe(BB);
        expect(attr1[1].id).toBe(CC);
        expect((await attr2[0].model1Entities)[0].id).toBe(EE);
        expect((await attr2[0].model1Entities)[1].id).toBe(FF);
        expect((await attr2[0].model1Entities)[2].id).toBe(GG);
        expect(attr2[0].id).toBe(DD);
        expect((await attr2[1].model1Entities)[0].id).toBe(II);
        expect(attr2[1].id).toBe(HH);

        createSpy.restore();
        generateIdStub.restore();
    });

    test("should save only attributes that were loaded", async () => {
        const mainEntity = new MainEntity();
        mainEntity.attribute1 = [
            { id: null, name: "Enlai", type: "dog", markedAsCannotDelete: false },
            new Entity1().populate({ id: null, name: "Bucky", type: "dog" })
        ];

        let modelCreate = sandbox
            .stub(mainEntity.getStorageDriver(), "create")
            .onCall(0)
            .callsFake(model => {
                model.id = "BB";
                return true;
            })
            .onCall(1)
            .callsFake(model => {
                model.id = "CC";
                return true;
            })
            .onCall(2)
            .callsFake(model => {
                model.id = "AA";
                return true;
            });

        let modelFind = sandbox.stub(mainEntity.getStorageDriver(), "find");

        await mainEntity.save();

        expect(modelCreate.callCount).toEqual(3);
        expect(modelFind.callCount).toEqual(0);

        modelCreate.restore();
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

        const AA = mdbid();
        const BB = mdbid();
        const CC = mdbid();
        const DD = mdbid();
        const EE = mdbid();
        const FF = mdbid();
        const GG = mdbid();
        const HH = mdbid();
        const II = mdbid();

        let createSpy = sandbox.spy(MainEntity.getStorageDriver(), "create");
        let generateIdStub = sandbox
            .stub(idGenerator, "generate")
            .onCall(0)
            .callsFake(() => BB)
            .onCall(1)
            .callsFake(() => CC)
            .onCall(2)
            .callsFake(() => DD)
            .onCall(3)
            .callsFake(() => EE)
            .onCall(4)
            .callsFake(() => FF)
            .onCall(5)
            .callsFake(() => GG)
            .onCall(6)
            .callsFake(() => HH)
            .onCall(7)
            .callsFake(() => II)
            .onCall(8)
            .callsFake(() => AA);

        await mainEntity.save();

        expect(createSpy.callCount).toEqual(9);
        createSpy.restore();
        generateIdStub.restore();

        let modelDelete = sandbox.stub(mainEntity.getStorageDriver(), "delete");
        let error = null;
        try {
            await mainEntity.delete();
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual("Cannot delete Entity1 model");
        expect(modelDelete.notCalled).toBeTruthy();

        (await mainEntity.attribute1)[0].markedAsCannotDelete = false;

        try {
            await mainEntity.delete();
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual("Cannot delete Entity1 model");
        expect(modelDelete.notCalled).toBeTruthy();

        const attribute2 = await mainEntity.attribute2;
        (await attribute2[0].model1Entities)[0].markedAsCannotDelete = false;
        //set("attribute2.0.model1Entities.0.markedAsCannotDelete", false);

        try {
            await mainEntity.delete();
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual("Cannot delete Entity1 model");
        expect(modelDelete.notCalled).toBeTruthy();

        (await attribute2[0].model1Entities)[1].markedAsCannotDelete = false;

        try {
            await mainEntity.delete();
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual("Cannot delete Entity2 model");
        expect(modelDelete.notCalled).toBeTruthy();

        attribute2[0].markedAsCannotDelete = false;

        try {
            await mainEntity.delete();
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual("Cannot delete Entity1 model");
        expect(modelDelete.notCalled).toBeTruthy();

        (await attribute2[1].model1Entities)[0].markedAsCannotDelete = false;

        try {
            await mainEntity.delete();
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual("Cannot delete Entity2 model");
        expect(modelDelete.notCalled).toBeTruthy();

        attribute2[1].markedAsCannotDelete = false;

        await mainEntity.delete();
        expect(modelDelete.callCount).toEqual(9);
        modelDelete.restore();
    });

    test("should properly delete linked models even though they are not loaded", async () => {
        const A = mdbid();
        const B = mdbid();
        const C = mdbid();
        const D = mdbid();
        const E = mdbid();
        const F = mdbid();
        const G = mdbid();
        const H = mdbid();
        const I = mdbid();

        let modelFindById = sandbox.stub(MainEntity.getStorageDriver(), "findOne").callsFake(() => {
            return { id: A };
        });
        const mainEntity = await MainEntity.findById(A);
        modelFindById.restore();

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

        expect(mainEntity.getField("attribute1").state.loaded).toBe(true);
        expect(mainEntity.getField("attribute1").state.loading).toBe(false);

        expect(mainEntity.getField("attribute1").current[0].id).toEqual(B);
        expect(mainEntity.getField("attribute1").current[1].id).toEqual(C);

        expect(mainEntity.getField("attribute2").state.loaded).toBe(false);
        expect(mainEntity.getField("attribute2").state.loading).toBe(false);

        expect(mainEntity.getField("attribute2").current.length).toBe(0);

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual("Cannot delete Entity1 model");
        expect(modelDelete.notCalled).toBeTruthy();

        expect(modelFind.callCount).toEqual(1);
        expect(modelDelete.callCount).toEqual(0);

        const attr1 = await mainEntity.attribute1;
        attr1[0].markedAsCannotDelete = false;

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

        expect(mainEntity.getField("attribute2").state.loaded).toBe(true);
        expect(mainEntity.getField("attribute2").state.loading).toBe(false);

        expect(mainEntity.getField("attribute2").current[0].id).toEqual(D);
        expect(mainEntity.getField("attribute2").current[1].id).toEqual(E);

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual("Cannot delete Entity2 model");
        expect(modelDelete.notCalled).toBeTruthy();

        expect(modelFind.callCount).toEqual(3);
        expect(modelDelete.callCount).toEqual(0);

        const attr2 = await mainEntity.attribute2;
        attr2[0].markedAsCannotDelete = false;

        error = null;
        try {
            await mainEntity.delete();
        } catch (e) {
            error = e;
        }

        expect(error).toBeNull();

        expect(modelFind.callCount).toEqual(4);
        expect(modelDelete.callCount).toEqual(9);

        modelFind.restore();
        modelDelete.restore();
    });
});
