import { MainEntity, Entity1, Entity2 } from "../../../resources/models/modelsAttributeModels";
import sinon from "sinon";
import mdbid from "mdbid";
import idGenerator from "@commodo/fields-storage/idGenerator";

const sandbox = sinon.createSandbox();

describe("model attribute current / initial values syncing", () => {
    afterEach(() => sandbox.restore());
    beforeEach(() => MainEntity.getStoragePool().flush());

    test("should delete previous initial values since auto save and auto delete are both enabled", async () => {
        const A = mdbid();
        const B = mdbid();
        const C = mdbid();

        let modelDelete = sandbox
            .stub(MainEntity.getStorageDriver(), "delete")
            .callsFake(() => true);

        let modelFindById = sandbox
            .stub(MainEntity.getStorageDriver(), "findOne")
            .callsFake(() => ({ id: A }));

        let modelFind = sandbox.stub(Entity1.getStorageDriver(), "find").callsFake(() => {
            return [
                [
                    { id: B, name: "b", type: "dog", markedAsCannotDelete: false },
                    { id: C, name: "c", type: "dog", markedAsCannotDelete: false }
                ]
            ];
        });

        const oneTwoThree = mdbid();
        const mainEntity = await MainEntity.findById(oneTwoThree);
        modelFindById.restore();

        mainEntity.attribute1 = [{ name: "x", type: "parrot" }];

        expect(mainEntity.getField("attribute1").initial[0]).not.toBeDefined();
        expect(mainEntity.getField("attribute1").initial[1]).not.toBeDefined();

        const X = mdbid();

        let saveSpy = sandbox.spy(mainEntity.getStorageDriver(), "save");
        let generateIdStub = sandbox
            .stub(idGenerator, "generate")
            .onCall(0)
            .callsFake(() => X);

        await mainEntity.save();

        expect(mainEntity.getField("attribute1").initial.length).toBe(1);
        expect(mainEntity.getField("attribute1").initial[0].id).toEqual(X);
        expect(mainEntity.getField("attribute1").current.length).toBe(1);
        expect(mainEntity.getField("attribute1").current[0].id).toEqual(X);
        expect(saveSpy.callCount).toEqual(2);
        expect(modelDelete.callCount).toEqual(2);

        generateIdStub.restore();
        saveSpy.restore();
        modelFind.restore();

        const D = mdbid();
        const E = mdbid();
        modelFind = sandbox.stub(Entity1.getStorageDriver(), "find").callsFake(() => {
            return [
                [
                    {
                        id: D,
                        firstName: "John",
                        lastName: "Doe"
                    },
                    {
                        id: E,
                        firstName: "Jane",
                        lastName: "Doe"
                    }
                ]
            ];
        });

        const F = mdbid();

        const attribute2 = await mainEntity.attribute2;

        attribute2.push(
            new Entity2().populate({ id: F, firstName: "Jane", lastName: "Doe" }).setExisting(true)
        );

        modelFind.restore();

        expect(mainEntity.getField("attribute2").initial[0].id).toEqual(D);
        expect(mainEntity.getField("attribute2").initial[1].id).toEqual(E);
        expect(mainEntity.getField("attribute2").initial.length).toBe(2);

        expect(mainEntity.getField("attribute2").current[0].id).toEqual(D);
        expect(mainEntity.getField("attribute2").current[1].id).toEqual(E);
        expect(mainEntity.getField("attribute2").current[2].id).toEqual(F);
        expect(mainEntity.getField("attribute2").current.length).toBe(3);

        await mainEntity.save();

        expect(mainEntity.getField("attribute2").initial[0].id).toEqual(D);
        expect(mainEntity.getField("attribute2").initial[1].id).toEqual(E);
        expect(mainEntity.getField("attribute2").initial[2].id).toEqual(F);
        expect(mainEntity.getField("attribute2").initial.length).toBe(3);

        expect(mainEntity.getField("attribute2").current[0].id).toEqual(D);
        expect(mainEntity.getField("attribute2").current[1].id).toEqual(E);
        expect(mainEntity.getField("attribute2").current[2].id).toEqual(F);
        expect(mainEntity.getField("attribute2").current.length).toBe(3);

        attribute2.pop();
        attribute2.pop();

        expect(mainEntity.getField("attribute2").current[0].id).toEqual(D);
        expect(mainEntity.getField("attribute2").current.length).toBe(1);
        expect(mainEntity.getField("attribute2").current[1]).toBe(undefined);
        expect(mainEntity.getField("attribute2").current[2]).toBe(undefined);

        saveSpy = sandbox.spy(mainEntity.getStorageDriver(), "save");
        generateIdStub = sandbox
            .stub(idGenerator, "generate")
            .onCall(0)
            .callsFake(() => F);

        mainEntity.attribute2 = [...attribute2]; // Force dirty check, since it's not the same array.
        await mainEntity.save();

        expect(modelDelete.callCount).toEqual(4);
        expect(saveSpy.callCount).toEqual(1);

        modelDelete.restore();
        saveSpy.restore();
        generateIdStub.restore();
    });
});
