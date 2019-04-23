import { One, Two } from "../../resources/models/oneTwoThree";
import sinon from "sinon";
import mdbid from "mdbid";

const sandbox = sinon.createSandbox();

describe("model attribute current / initial values syncing", () => {
    afterEach(() => sandbox.restore());

    test("should correctly sync current and initial values", async () => {
        let modelDelete = sandbox.spy(One.getStorageDriver(), "delete");
        let modelFindById = sandbox
            .stub(One.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: "one", name: "One", two: "two" };
            })
            .onCall(1)
            .callsFake(() => {
                return { id: "two", name: "Two" };
            });

        const one = await One.findById("a");
        expect(await one.getField("two").getStorageValue()).toEqual("two");
        expect(one.getField("two").current).toEqual("two");
        expect(one.getField("two").initial).toEqual("two");

        one.two = { name: "Another Two" };
        modelFindById.restore();

        let modelSave = sandbox
            .stub(One.getStorageDriver(), "save")
            .onCall(0)
            .callsFake(({ model }) => {
                model.id = "anotherTwo";
                return true;
            })
            .onCall(1)
            .callsFake(() => {
                return true;
            });

        await one.save();

        expect(await one.getField("two").getStorageValue()).toEqual("anotherTwo");
        expect(one.getField("two").current.id).toEqual("anotherTwo");
        expect(one.getField("two").initial.id).toEqual("anotherTwo");

        modelDelete.restore();
        modelSave.restore();
    });

    test("should correctly sync initial and current value when null is present", async () => {
        const ids = { one: mdbid() };

        let modelDelete = sandbox.spy(One.getStorageDriver(), "delete");
        let modelFindById = sandbox.stub(One.getStorageDriver(), "findOne").callsFake(() => {
            return { id: ids.one, name: "One", two: null };
        });

        const one = await One.findById(ids.one);
        modelFindById.restore();

        expect(await one.getField("two").getStorageValue()).toEqual(null);
        expect(one.getField("two").current).toEqual(null);
        expect(one.getField("two").initial).toEqual(null);

        one.two = { name: "Another Two" };
        modelFindById.restore();

        expect(await one.getField("two").getStorageValue()).toEqual(null);
        expect(one.getField("two").current.name).toEqual("Another Two");
        expect(one.getField("two").initial).toEqual(null);

        let modelSave = sandbox
            .stub(One.getStorageDriver(), "save")
            .onCall(0)
            .callsFake(({ model }) => {
                model.id = "anotherTwo";
                return true;
            })
            .onCall(1)
            .callsFake(() => {
                return true;
            });

        await one.save();

        expect(await one.getField("two").getStorageValue()).toEqual("anotherTwo");
        expect(one.getField("two").current.id).toEqual("anotherTwo");
        expect(one.getField("two").initial.id).toEqual("anotherTwo");

        one.two = null;

        expect(await one.getField("two").getStorageValue()).toEqual(null);
        expect(one.getField("two").current).toEqual(null);
        expect(one.getField("two").initial.id).toEqual("anotherTwo");

        await one.save();

        expect(await one.getField("two").getStorageValue()).toEqual(null);
        expect(one.getField("two").current).toEqual(null);
        expect(one.getField("two").initial).toEqual(null);

        modelDelete.restore();
        modelSave.restore();
    });

    test("should not load when setting new values but again correctly sync when saving", async () => {
        const ids = { one: mdbid(), two: mdbid(), anotherTwo: mdbid() };

        let modelFindById = sandbox
            .stub(One.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: ids.one, name: "One", two: ids.two };
            })
            .onCall(1)
            .callsFake(() => {
                return { id: ids.two, name: "Two" };
            });

        let modelSave = sandbox
            .stub(One.getStorageDriver(), "save")
            .onCall(0)
            .callsFake(({ model }) => {
                model.id = ids.anotherTwo;
                return true;
            })
            .onCall(1)
            .callsFake(() => {
                return true;
            });

        const modelDelete = sandbox.stub(One.getStorageDriver(), "delete").callsFake(() => {
            true;
        });

        const one = await One.findById(ids.one);
        const attrTwo = one.getField("two");

        expect(attrTwo.state.loading).toBe(false);
        expect(attrTwo.state.loaded).toBe(false);

        one.two = { name: "Another Two" };
        await one.getField("two").setValue({ name: "Another Two" });

        expect(attrTwo.state.loading).toBe(false);
        expect(attrTwo.state.loaded).toBe(false);

        expect(attrTwo.current.name).toEqual("Another Two");

        expect((await one.two).name).toEqual("Another Two");
        expect(attrTwo.state.loading).toBe(false);
        expect(attrTwo.state.loaded).toBe(false);

        // Initial value wasn't loaded - will be loaded on save.
        expect(attrTwo.initial).toEqual(ids.two);

        await one.save();

        expect(modelSave.callCount).toEqual(2);
        expect(one.id).toEqual(ids.one);
        expect(attrTwo.state.loading).toBe(false);
        expect(attrTwo.state.loaded).toBe(true);
        expect(attrTwo.current.id).toEqual(ids.anotherTwo);
        expect(attrTwo.initial.id).toEqual(ids.anotherTwo);

        // Also make sure deletes have been called on initially set model (with id "two").
        expect(modelDelete.callCount).toEqual(1);

        modelSave.restore();
        modelDelete.restore();
        modelFindById.restore();
    });
});
