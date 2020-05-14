import { One } from "../../resources/models/oneTwoThree";
import sinon from "sinon";
import mdbid from "mdbid";

const sandbox = sinon.createSandbox();
const getEntity = async () => {
    const id = mdbid();

    let modelFindById = sandbox
        .stub(One.getStorageDriver(), "findOne")
        .onCall(0)
        .callsFake(() => {
            return { id, name: "One", two: "two" };
        });

    const model = await One.findById(id);
    modelFindById.restore();
    return model;
};

describe("dirty flag test", () => {
    beforeEach(() => One.getStoragePool().flush());
    afterEach(() => sandbox.restore());

    test("when loading from storage, default value must be clean", async () => {
        const model = await getEntity();
        const twoAttribute = model.getField("two");
        expect(twoAttribute.state.dirty).toBe(false);
    });

    test("new model - when setting a value, dirty must be set as true only if different", async () => {
        let model = new One();
        let twoAttribute = model.getField("two");

        model.two = "anotherTwo";
        expect(twoAttribute.state.dirty).toBe(true);

        model = new One();
        twoAttribute = model.getField("two");

        model.two = null;
        expect(twoAttribute.state.dirty).toBe(false);

        model = new One();
        twoAttribute = model.getField("two");

        model.two = { something: true };
        expect(twoAttribute.state.dirty).toBe(true);

        model = new One();
        twoAttribute = model.getField("two");

        model.two = { id: "asd" };
        expect(twoAttribute.state.dirty).toBe(true);

        model = new One();
        twoAttribute = model.getField("two");

        model.two = { id: "asd", something: true };
        expect(twoAttribute.state.dirty).toBe(true);
    });

    test("loaded model - when setting a value, dirty must be set as true only if different", async () => {
        let model = await getEntity();
        let twoAttribute = model.getField("two");

        model.two = "anotherTwo";
        expect(twoAttribute.state.dirty).toBe(true);

        model = await getEntity();
        twoAttribute = model.getField("two");

        model.two = "two";
        expect(twoAttribute.state.dirty).toBe(false);

        model = await getEntity();
        twoAttribute = model.getField("two");

        model.two = null;
        expect(twoAttribute.state.dirty).toBe(true);
    });

    test("when setting an object with ID, value must not be dirty if ID is same", async () => {
        let model = await getEntity();
        let twoAttribute = model.getField("two");

        model.two = { id: "two" };
        expect(twoAttribute.state.dirty).toBe(false);
    });

    test("when setting an object with ID but with additional fields, value must be set as dirty", async () => {
        let model = await getEntity();
        let twoAttribute = model.getField("two");

        model.two = { id: "two", someAttr: 1 };
        expect(twoAttribute.state.dirty).toBe(true);
    });

    test("should not be dirty when loading value from storage", async () => {
        const one = await getEntity();
        const twoAttribute = one.getField("two");
        expect(twoAttribute.state.dirty).toBe(false);

        let findById = sandbox.stub(One.getStorageDriver(), "findOne").callsFake(() => {
            return { id: "two", name: "Two" };
        });

        const two = await one.two;
        expect(twoAttribute.state.dirty).toBe(false);

        two.name = "anotherName";

        expect(twoAttribute.isDirty()).toBe(true);

        findById.restore();
    });

    test("should save model only if dirty, and set it as clean after save", async () => {
        const one = await getEntity();

        let findById = sandbox.stub(One.getStorageDriver(), "findOne").callsFake(() => {
            return { id: "two", name: "Two" };
        });

        const two = await one.two;
        findById.restore();

        const modelUpdateSpy = sandbox.spy(One.getStorageDriver(), "update");

        await one.save();
        expect(modelUpdateSpy.callCount).toEqual(0);

        two.name = "anotherName";
        expect(two.isDirty()).toBe(true);
        await one.save();
        expect(modelUpdateSpy.callCount).toEqual(1);
        expect(!two.isDirty()).toBe(true);

        await one.save();
        expect(modelUpdateSpy.callCount).toEqual(1);
        expect(!two.isDirty()).toBe(true);
    });
});
