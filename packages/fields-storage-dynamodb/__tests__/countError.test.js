import sinon from "sinon";
import SimpleModel from "./models/simpleModel";
const sandbox = sinon.createSandbox();
import { database } from "./database";

describe("count error test", function() {
    it.skip("count - an error must be thrown", async () => {
        const countStub = sandbox.stub(database, "countDocuments").callsFake(() => {
            throw Error("This is an error.");
        });

        try {
            await SimpleModel.count();
        } catch (e) {
            return;
        } finally {
            countStub.restore();
        }
        throw Error(`Error should've been thrown.`);
    });
});
