import sinon from "sinon";
import { Entity1, MainEntity } from "../../../resources/models/modelsAttributeModels";
import mdbid from "mdbid";

const sandbox = sinon.createSandbox();

describe("getValue test (without Storage)", () => {
    beforeEach(() => MainEntity.getStoragePool().flush());
    afterEach(() => sandbox.restore());

    test("should load only once when getting value", async () => {
        const mainEntityId = mdbid();

        const modelFindStub = sandbox
            .stub(MainEntity.getStorageDriver(), "findOne")
            .callsFake(() => {
                return { id: mainEntityId };
            });

        const mainEntity = await MainEntity.findById(mainEntityId);
        modelFindStub.restore();

        const modelFindSpy = sandbox.spy(MainEntity.getStorageDriver(), "find");

        expect(mainEntity.getField("attribute1").state.loading).toBe(false);
        expect(mainEntity.getField("attribute1").state.loaded).toBe(false);

        await mainEntity.attribute1;

        expect(mainEntity.getField("attribute1").state.loading).toBe(false);
        expect(mainEntity.getField("attribute1").state.loaded).toBe(true);

        expect(modelFindSpy.callCount).toEqual(1);

        await mainEntity.attribute1;
        await mainEntity.attribute1;
        await mainEntity.attribute1;

        expect(mainEntity.getField("attribute1").state.loading).toBe(false);
        expect(mainEntity.getField("attribute1").state.loaded).toBe(true);

        expect(modelFindSpy.callCount).toEqual(1);
    });

    test("when a new value is set, attribute should not load anything", async () => {
        const mainEntity = new MainEntity();
        mainEntity.attribute1 = [
            { id: null, name: "Enlai", type: "invalid", markedAsCannotDelete: true },
            new Entity1().populate({ id: null, name: "Bucky", type: "invalid" }),
            "something"
        ];

        expect(mainEntity.getField("attribute1").state.loading).toBe(false);
        expect(mainEntity.getField("attribute1").state.loaded).toBe(false);

        expect(mainEntity.getField("attribute1").current.length).toBe(3);
        expect(typeof mainEntity.getField("attribute1").current[0]).toBe("object");
        expect(mainEntity.getField("attribute1").current[1]).toBeInstanceOf(Entity1);
        expect(mainEntity.getField("attribute1").current[2]).toEqual("something");

        expect(mainEntity.getField("attribute1").state.loading).toBe(false);
        expect(mainEntity.getField("attribute1").state.loaded).toBe(false);
    });

    test("when a new id is set, getting the value should return a loaded instance, or value itself if load failed", async () => {
        const mainEntity = new MainEntity();
        const model1Id = mdbid();
        const model2Id = mdbid();

        mainEntity.attribute1 = [model1Id, model2Id, "invalid-1"];

        expect(mainEntity.getField("attribute1").state.loading).toBe(false);
        expect(mainEntity.getField("attribute1").state.loaded).toBe(false);

        expect(mainEntity.getField("attribute1").current.length).toBe(3);
        expect(mainEntity.getField("attribute1").current[0]).toEqual(model1Id);
        expect(mainEntity.getField("attribute1").current[1]).toEqual(model2Id);
        expect(mainEntity.getField("attribute1").current[2]).toEqual("invalid-1");

        const modelFindOneStub = sandbox
            .stub(MainEntity.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: model1Id, name: "Entity 1", type: "dog" };
            })
            .onCall(1)
            .callsFake(() => {
                return { id: model2Id, name: "Entity 2", type: "cat" };
            })
            .onCall(2)
            .callsFake(() => {
                return true;
            });

        const models = await mainEntity.attribute1;

        expect(models[0]).toBeInstanceOf(Entity1);
        expect(models[0].id).toEqual(model1Id);
        expect(models[1]).toBeInstanceOf(Entity1);
        expect(models[1].id).toEqual(model2Id);

        expect(models[2]).toEqual("invalid-1");

        modelFindOneStub.restore();
        expect(mainEntity.getField("attribute1").state.loading).toBe(false);
        expect(mainEntity.getField("attribute1").state.loaded).toBe(false);
    });

    test("when loading an instance from passed ID, load must happen only on first call, only if not loaded, then load", async () => {
        const mainEntity = new MainEntity();
        const model1Id = mdbid();
        const model2Id = mdbid();
        mainEntity.attribute1 = [model1Id, model2Id, "invalid@"];

        const modelFindOneStub = sandbox
            .stub(MainEntity.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: model1Id, name: "Entity 1", type: "dog" };
            })
            .onCall(1)
            .callsFake(() => {
                return { id: model2Id, name: "Entity 2", type: "cat" };
            })
            .onCall(2)
            .callsFake(() => {
                return true;
            });

        await mainEntity.attribute1;

        expect(modelFindOneStub.callCount).toEqual(2);
        modelFindOneStub.restore();

        const modelFindOneSpy = sandbox.spy(MainEntity.getStorageDriver(), "findOne");
        await mainEntity.attribute1;
        await mainEntity.attribute1;
        await mainEntity.attribute1;
        await mainEntity.attribute1;

        // First two instances were loaded, last 'invalid@' won't load since ID is invalid
        expect(modelFindOneSpy.callCount).toEqual(0);

        expect(mainEntity.getField("attribute1").state.loading).toBe(false);
        expect(mainEntity.getField("attribute1").state.loaded).toBe(false);
    });

    test("should get values correctly even on multiple set calls", async () => {
        const mainEntity = new MainEntity();

        mainEntity.attribute1 = [
            new Entity1().populate({ id: "one" }),
            new Entity1().populate({ id: "two" }),
            new Entity1().populate({ id: "three" })
        ];

        const attribute1 = await mainEntity.attribute1;
        expect(attribute1[0].id).toEqual("one");
        expect(attribute1[1].id).toEqual("two");
        expect(attribute1[2].id).toEqual("three");

        const attribute1Again = await mainEntity.attribute1;
        expect(attribute1Again[0].id).toEqual("one");
        expect(attribute1Again[1].id).toEqual("two");
        expect(attribute1Again[2].id).toEqual("three");
    });
});
