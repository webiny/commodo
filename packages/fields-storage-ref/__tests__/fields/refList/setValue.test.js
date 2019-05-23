import { One, Two } from "../../resources/models/oneTwoThree";
import sinon from "sinon";
import { Entity1, MainEntity } from "../../resources/models/modelsAttributeModels";
import mdbid from "mdbid";

const sandbox = sinon.createSandbox();

describe("setValue test", () => {
    beforeEach(() => One.getStoragePool().flush());
    afterEach(() => sandbox.restore());

    const a = mdbid();
    const b = mdbid();
    const c = mdbid();

    test("should accept a valid ID", async () => {
        const model = new MainEntity();
        model.attribute1 = [a, b, c];
        expect(model.getField("attribute1").current).toEqual([a, b, c]);
        expect(model.getField("attribute1").initial.length).toBe(0);

        let modelFind = sandbox
            .stub(Entity1.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return {
                    id: a,
                    name: "A",
                    type: "dog",
                    markedAsCannotDelete: false
                };
            })
            .onCall(1)
            .callsFake(() => {
                return {
                    id: b,
                    name: "B",
                    type: "dog",
                    markedAsCannotDelete: false
                };
            })
            .onCall(2)
            .callsFake(() => {
                return {
                    id: c,
                    name: "C",
                    type: "dog",
                    markedAsCannotDelete: false
                };
            });

        const attribute1 = await model.attribute1;
        expect(model.getField("attribute1").state.loading).toBe(false);
        expect(model.getField("attribute1").state.loaded).toBe(false);

        expect(attribute1[0].id).toEqual(a);
        expect(attribute1[1].id).toEqual(b);
        expect(attribute1[2].id).toEqual(c);
        expect(model.getField("attribute1").state.loading).toBe(false);
        expect(model.getField("attribute1").state.loaded).toBe(false);

        modelFind.restore();
    });

    test("should accept an invalid ID and return it when trying to get attribute's value", async () => {
        const model = new MainEntity();
        model.attribute1 = ["a", "b", { id: "c" }];
        expect(model.getField("attribute1").current).toEqual(["a", "b", { id: "c" }]);
        expect(model.getField("attribute1").initial.length).toBe(0);

        let modelFindOne = sandbox.spy(Entity1.getStorageDriver(), "findOne");

        const attribute1 = await model.attribute1;
        expect(model.getField("attribute1").state.loading).toBe(false);
        expect(model.getField("attribute1").state.loaded).toBe(false);

        expect(attribute1[0]).toEqual("a");
        expect(attribute1[1]).toEqual("b");
        expect(attribute1[2].id).toEqual("c");
        expect(model.getField("attribute1").state.loading).toBe(false);
        expect(model.getField("attribute1").state.loaded).toBe(false);

        modelFindOne.restore();
    });

    test("should accept an object with a valid ID", async () => {
        const model = new MainEntity();
        model.attribute1 = [{ id: "a" }, { id: "b" }, { id: "c" }];
        expect(model.getField("attribute1").current).toEqual([
            { id: "a" },
            { id: "b" },
            { id: "c" }
        ]);
        expect(model.getField("attribute1").initial.length).toBe(0);

        let modelFind = sandbox
            .stub(Entity1.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return {
                    id: "a",
                    name: "A",
                    type: "dog",
                    markedAsCannotDelete: false
                };
            })
            .onCall(1)
            .callsFake(() => {
                return {
                    id: "b",
                    name: "B",
                    type: "dog",
                    markedAsCannotDelete: false
                };
            })
            .onCall(2)
            .callsFake(() => {
                return {
                    id: "c",
                    name: "C",
                    type: "dog",
                    markedAsCannotDelete: false
                };
            });

        const attribute1 = await model.attribute1;
        expect(model.getField("attribute1").state.loading).toBe(false);
        expect(model.getField("attribute1").state.loaded).toBe(false);

        expect(attribute1[0].id).toEqual("a");
        expect(attribute1[1].id).toEqual("b");
        expect(attribute1[2].id).toEqual("c");
        expect(model.getField("attribute1").state.loading).toBe(false);
        expect(model.getField("attribute1").state.loaded).toBe(false);

        modelFind.restore();
    });

    test("should accept an invalid ID inside an object and return it when trying to get attribute's value", async () => {
        const model = new MainEntity();
        model.attribute1 = [{ id: "a" }, { id: "b" }, { id: "c" }];
        expect(model.getField("attribute1").current).toEqual([
            { id: "a" },
            { id: "b" },
            { id: "c" }
        ]);
        expect(model.getField("attribute1").initial.length).toBe(0);

        let modelFind = sandbox.spy(Entity1.getStorageDriver(), "findOne");

        const attribute1 = await model.attribute1;
        expect(model.getField("attribute1").state.loading).toBe(false);
        expect(model.getField("attribute1").state.loaded).toBe(false);

        expect(attribute1[0].id).toEqual("a");
        expect(attribute1[1].id).toEqual("b");
        expect(attribute1[2].id).toEqual("c");
        expect(model.getField("attribute1").state.loading).toBe(false);
        expect(model.getField("attribute1").state.loaded).toBe(false);

        modelFind.restore();
    });

    test("after loading from storage, loaded model must be populated with received object data", async () => {
        const model = new MainEntity();
        model.attribute1 = [{ id: "a" }, { id: "b" }, { id: "c" }];
        expect(model.getField("attribute1").current).toEqual([
            { id: "a" },
            { id: "b" },
            { id: "c" }
        ]);
        expect(model.getField("attribute1").initial.length).toBe(0);

        const attribute1 = await model.attribute1;
        expect(model.getField("attribute1").state.loading).toBe(false);
        expect(model.getField("attribute1").state.loaded).toBe(false);

        expect(attribute1[0].id).toEqual("a");
        expect(attribute1[1].id).toEqual("b");
        expect(attribute1[2].id).toEqual("c");
        expect(model.getField("attribute1").state.loading).toBe(false);
        expect(model.getField("attribute1").state.loaded).toBe(false);
    });
});
