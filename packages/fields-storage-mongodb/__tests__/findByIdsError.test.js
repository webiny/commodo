import sinon from "sinon";
import SimpleModel from "./models/simpleModel";
const sandbox = sinon.createSandbox();
import { collection } from "./database";
import mdbid from "mdbid";

describe("findByIds error test", function() {
    afterEach(() => sandbox.restore());

    it("findByIds - should throw an error", async () => {
        const findOneStub = sandbox.stub(collection, "find").callsFake(() => {
            throw Error("This is an error.");
        });

        const oneTwoThree = mdbid();
        try {
            await SimpleModel.findByIds([oneTwoThree]);
        } catch (e) {
            return;
        } finally {
            findOneStub.restore();
        }
        throw Error(`Error should've been thrown.`);
    });
});
