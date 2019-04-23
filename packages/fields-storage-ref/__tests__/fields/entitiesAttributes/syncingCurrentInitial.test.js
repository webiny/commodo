import { MainEntity, Entity1 } from "../../resources/models/modelsAttributeModels";
import mdbid from "mdbid";
import sinon from "sinon";

const sandbox = sinon.createSandbox();

describe("save and delete models attribute test", () => {
    afterEach(() => sandbox.restore());

    test("should replace models if direct assign was made or correctly update the list otherwise", async () => {
        const A = mdbid();
        const B = mdbid();
        const C = mdbid();
        const x = 'entity-x';

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

        const mainEntity = await MainEntity.findById(A);
        modelFindById.restore();

        mainEntity.getField("attribute1").setValue([{ name: x, type: "parrot" }]);

        expect(mainEntity.getField("attribute1").state.loading).toBe(false);
        expect(mainEntity.getField("attribute1").state.loaded).toBe(false);

        const value = mainEntity.getField("attribute1");
        expect(value.initial.length).toBe(0);
        expect(value.current[0].name).toBe(x);

        const X = mdbid();

        let modelSave = sandbox
            .stub(mainEntity.getStorageDriver(), "save")
            .onCall(1)
            .callsFake(({ model }) => {
                model.id = X;
                return true;
            })
            .onCall(0)
            .callsFake(() => true);

        await mainEntity.save();

        expect(mainEntity.getField("attribute1").state.loading).toBe(false);
        expect(mainEntity.getField("attribute1").state.loaded).toBe(true);

        expect(mainEntity.getField("attribute1").initial.length).toBe(1);
        expect(mainEntity.getField("attribute1").initial[0].id).toEqual(X);
        expect(mainEntity.getField("attribute1").current.length).toBe(1);
        expect(mainEntity.getField("attribute1").current[0].id).toEqual(X);

        modelSave.restore();
        modelFind.restore();

        const y = mdbid();
        const z = mdbid();

        mainEntity.attribute1 = [{ name: y, type: "dog" }, { name: z, type: "parrot" }];

        expect(mainEntity.getField("attribute1").initial.length).toBe(1);
        expect(mainEntity.getField("attribute1").initial[0].id).toEqual(X);
        expect(mainEntity.getField("attribute1").current.length).toBe(2);
        expect(mainEntity.getField("attribute1").current[0].name).toEqual(y);
        expect(mainEntity.getField("attribute1").current[1].name).toEqual(z);

        const Y = mdbid();
        const Z = mdbid();

        modelSave = sandbox
            .stub(mainEntity.getStorageDriver(), "save")
            .onCall(1)
            .callsFake(({ model }) => {
                model.id = Y;
                return true;
            })
            .onCall(2)
            .callsFake(({ model }) => {
                model.id = Z;
                return true;
            })
            .onCall(0)
            .callsFake(() => true);

        await mainEntity.save();

        expect(mainEntity.getField("attribute1").initial.length).toBe(2);
        expect(mainEntity.getField("attribute1").initial[0].id).toEqual(Y);
        expect(mainEntity.getField("attribute1").initial[1].id).toEqual(Z);
        expect(mainEntity.getField("attribute1").current.length).toBe(2);
        expect(mainEntity.getField("attribute1").current[0].id).toEqual(Y);
        expect(mainEntity.getField("attribute1").current[1].id).toEqual(Z);

        modelSave.restore();

        mainEntity.attribute1 = null;
        expect(mainEntity.getField("attribute1").initial.length).toBe(2);
        expect(mainEntity.getField("attribute1").initial[0].id).toEqual(Y);
        expect(mainEntity.getField("attribute1").initial[1].id).toEqual(Z);

        expect(mainEntity.getField("attribute1").current).toBeNull();
    });
});
