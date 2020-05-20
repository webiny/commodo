import { One, Two } from "../../resources/models/oneTwoThree";
import sinon from "sinon";
import mdbid from "mdbid";

const sandbox = sinon.createSandbox();

describe("populate test", () => {
    beforeEach(() => One.getStoragePool().flush());
    afterEach(() => sandbox.restore());

    test("should not load anything if no ID was received from storage", async () => {
        const ids = { one: mdbid(), two: mdbid() };

        const findById = sandbox
            .stub(One.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: ids.one, name: "One" };
            });

        const model = await One.findById(ids.one);
        expect(model.getField("two").state.loaded).toBe(false);
        expect(model.getField("two").state.loading).toBe(false);
        await model.two;
        expect(model.getField("two").state.loaded).toBe(true);
        expect(model.getField("two").state.loading).toBe(false);
        expect(await model.two).toBeNull();

        findById.restore();
    });

    test("should load model if received an ID from storage", async () => {
        const ids = {
            one: mdbid(),
            two: mdbid()
        };

        let findById = sandbox
            .stub(One.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: ids.one, name: "One", two: ids.two };
            });

        const model = await One.findById(ids.one);
        expect(model.getField("two").state.loaded).toBe(false);
        expect(model.getField("two").state.loading).toBe(false);

        findById.restore();

        findById = sandbox.stub(One.getStorageDriver(), "findOne").callsFake(() => {
            return { id: ids.two, name: "Two" };
        });

        await model.two;
        expect(model.getField("two").state.loaded).toBe(true);
        expect(model.getField("two").state.loading).toBe(false);
        expect(await model.two).toBeInstanceOf(Two);
        expect((await model.two).id).toBe(ids.two);

        findById.restore();
    });

    test("when a new value is set, attribute should not load anything even though storage value exists", async () => {
        let findOneSpy = sandbox.spy(One.getStorageDriver(), "findOne");
        const model1 = new One();

        const ids = {
            one: mdbid(),
            two: mdbid(),
            invalidTwo: mdbid()
        };

        expect(model1.getField("two").state.loaded).toBe(false);
        expect(model1.getField("two").state.loading).toBe(false);

        model1.two = { id: ids.invalidTwo };
        expect(model1.getField("two").state.loaded).toBe(false);
        expect(model1.getField("two").state.loading).toBe(false);

        expect(typeof (await model1.two)).toBe("object");
        expect(model1.getField("two").state.loaded).toBe(false);
        expect(model1.getField("two").state.loading).toBe(false);

        expect(findOneSpy.callCount).toEqual(1);
        findOneSpy.restore();

        const findById = sandbox
            .stub(One.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: ids.one, name: "One", two: ids.two };
            });

        const model2 = await One.findById(ids.one);
        findById.restore();

        findOneSpy = sandbox.spy(One.getStorageDriver(), "findOne");

        expect(model2.getField("two").state.loaded).toBe(false);
        expect(model2.getField("two").state.loading).toBe(false);

        model1.two = { id: ids.invalidTwo };

        expect(model2.getField("two").state.loaded).toBe(false);
        expect(model2.getField("two").state.loading).toBe(false);

        expect(await model1.two).toEqual({ id: ids.invalidTwo });
        expect(findOneSpy.callCount).toEqual(1);
        findOneSpy.restore();
    });

    test("when a new id is set, getting the value should return a loaded instance", async () => {
        const one = new One();

        const ids = {
            newTwo: mdbid()
        };

        one.two = { id: ids.newTwo };

        expect(one.getField("two").state.loaded).toBe(false);
        expect(one.getField("two").state.loading).toBe(false);

        let findById = sandbox.stub(One.getStorageDriver(), "findOne").callsFake(() => {
            return { id: ids.newTwo, name: "New Two" };
        });

        await one.two;

        expect((await one.two).id).toEqual(ids.newTwo);
        expect((await one.two).name).toEqual("New Two");
        expect(findById.callCount).toEqual(1);
        expect(one.getField("two").state.loaded).toBe(false);
        expect(one.getField("two").state.loading).toBe(false);

        findById.restore();
    });

    test("when an invalid id is set, getting the value should return initially set value", async () => {
        const one = new One();

        const ids = { newTwo: mdbid() };

        one.two = { id: ids.newTwo };

        expect(one.getField("two").state.loaded).toBe(false);
        expect(one.getField("two").state.loading).toBe(false);

        const findById = sandbox.spy(One.getStorageDriver(), "findOne");
        const two = await one.two;
        expect(findById.callCount).toEqual(1);
        expect(two).toEqual({ id: ids.newTwo });

        expect(one.getField("two").state.loaded).toBe(false);
        expect(one.getField("two").state.loading).toBe(false);
        findById.restore();
    });

    test("when loading an instance from passed ID, load must happen only on first call", async () => {
        const one = new One();

        const ids = {
            newTwo: mdbid()
        };

        one.two = { id: ids.newTwo };

        expect(one.getField("two").state.loaded).toBe(false);
        expect(one.getField("two").state.loading).toBe(false);
        let findById = sandbox.stub(One.getStorageDriver(), "findOne").callsFake(() => {
            return { id: ids.newTwo, name: "New Two" };
        });

        await one.two;
        await one.two;
        await one.two;

        expect(findById.callCount).toEqual(1);
        expect(one.getField("two").state.loaded).toBe(false);
        expect(one.getField("two").state.loading).toBe(false);
        findById.restore();
    });

    test("should get values correctly even on multiple set calls", async () => {
        const one = new One();

        const ids = { newTwo: mdbid() };

        one.two = { id: ids.newTwo };

        expect(one.getField("two").state.loaded).toBe(false);
        expect(one.getField("two").state.loading).toBe(false);

        let findById = sandbox.stub(One.getStorageDriver(), "findOne").callsFake(() => {
            return { id: ids.newTwo, name: "New Two" };
        });

        await one.two;

        expect(findById.callCount).toEqual(1);
        expect(one.getField("two").state.loaded).toBe(false);
        expect(one.getField("two").state.loading).toBe(false);
        expect(await one.two).toBeInstanceOf(Two);
        expect((await one.two).name).toEqual("New Two");

        one.two = null;

        expect(await one.two).toBeNull();
        expect(findById.callCount).toEqual(1);
        expect(one.getField("two").state.loaded).toBe(false);
        expect(one.getField("two").state.loading).toBe(false);

        const newTwo = new Two();
        newTwo.name = "Again new Two";

        one.two = newTwo;

        expect(findById.callCount).toEqual(1);
        expect(one.getField("two").state.loaded).toBe(false);
        expect(one.getField("two").state.loading).toBe(false);

        expect(await one.two).toBeInstanceOf(Two);
        expect((await one.two).name).toEqual("Again new Two");

        findById.restore();
    });
});
