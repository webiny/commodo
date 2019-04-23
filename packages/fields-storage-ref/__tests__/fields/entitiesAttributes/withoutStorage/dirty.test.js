import { MainEntity } from "../../../resources/models/modelsAttributeModels";
import sinon from "sinon";
const sandbox = sinon.createSandbox();
import mdbid from "mdbid";

describe("dirty flag test", () => {
    beforeEach(() => MainEntity.getStoragePool().flush());

    test("when loading from storage, default value must be clean", async () => {
        const ten = mdbid();
        const modelFind = sandbox.stub(MainEntity.getStorageDriver(), "findOne").callsFake(() => {
            return ({ id: ten });
        });

        const oneTwoThree = mdbid();
        const model = await MainEntity.findById(oneTwoThree);
        expect(model.getField("attribute1").state.dirty).toBe(false);
        modelFind.restore();
    });

    test("when setting a value, dirty must be set as true", async () => {
        const model = new MainEntity();
        const attr = model.getField("attribute1");
        expect(attr.state.dirty).toBe(false);
        model.attribute1 = null;
        expect(attr.state.dirty).toBe(true);
    });
});
