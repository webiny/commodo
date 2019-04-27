import sinon from "sinon";
import User from "./resources/models/User";
import mdbid from "mdbid";

const sandbox = sinon.createSandbox();
describe("findOne test", function() {
    afterEach(() => sandbox.restore());

    it("findOne - must throw an error if storage data is invalid", async () => {
        const findOneStub = sandbox.stub(User.getStorageDriver(), "find").callsFake(() => {
            return [
                [
                    {
                        id: mdbid(),
                        enabled: 123
                    }
                ]
            ];
        });

        try {
            await User.find();
        } catch (e) {
            expect(e.message).toBe(
                'Invalid data type: boolean field "enabled" cannot accept value 123.'
            );
            return;
        } finally {
            findOneStub.restore();
        }

        throw Error(`Error should've been thrown.`);
    });
});
