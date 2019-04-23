import sinon from "sinon";
import SimpleModel from "./models/simpleModel";
const sandbox = sinon.createSandbox();
import { collection, findCursor } from "./database";
import mdbid from "mdbid";

describe("findByIds test", function() {
    afterEach(() => {
        sandbox.restore();
        findCursor.data = [];
    });
    beforeEach(() => SimpleModel.getStoragePool().flush());

    it("must generate correct query", async () => {
        const findOneSpy = sandbox.spy(collection, "find");
        const countSpy = sandbox.spy(collection, "countDocuments");

        const a = mdbid();
        const b = mdbid();
        const c = mdbid();

        await SimpleModel.findByIds([a, b, c]);
        expect(findOneSpy.getCall(0).args[0]).toEqual({
            id: a
        });

        expect(findOneSpy.getCall(1).args[0]).toEqual({
            id: b
        });

        expect(findOneSpy.getCall(2).args[0]).toEqual({
            id: c
        });

        expect(countSpy.callCount).toBe(0);
        countSpy.restore();
        findOneSpy.restore();
    });

    it("findByIds - should find previously inserted models", async () => {
        sandbox
            .stub(collection, "find")
            .onCall(0)
            .callsFake(() => {
                findCursor.data = [
                    {
                        id: "57eb6814c4ddf57b1c6697a9",
                        name: "This is a test",
                        slug: "thisIsATest",
                        enabled: true
                    }
                ];

                return findCursor;
            })
            .onCall(1)
            .callsFake(() => {
                findCursor.data = [
                    {
                        id: "57eb6814c4ddf57b1c6697aa",
                        name: "This is a test 222",
                        slug: "thisIsATest222",
                        enabled: false
                    }
                ];
                return findCursor;
            });

        const simpleModels = await SimpleModel.findByIds([
            "57eb6814c4ddf57b1c6697a9",
            "57eb6814c4ddf57b1c6697aa"
        ]);
        findCursor.data = [];

        expect(simpleModels[0].id).toBe("57eb6814c4ddf57b1c6697a9");
        expect(simpleModels[0].name).toBe("This is a test");
        expect(simpleModels[0].slug).toBe("thisIsATest");
        expect(simpleModels[0].enabled).toBe(true);

        expect(simpleModels[1].id).toBe("57eb6814c4ddf57b1c6697aa");
        expect(simpleModels[1].name).toBe("This is a test 222");
        expect(simpleModels[1].slug).toBe("thisIsATest222");
        expect(simpleModels[1].enabled).toBe(false);
    });
});
