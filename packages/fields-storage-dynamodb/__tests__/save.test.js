import sinon from "sinon";
import SimpleModel from "./models/simpleModel";
import { database } from "./database";


const sandbox = sinon.createSandbox();

describe("save test", function() {
    afterEach(() => sandbox.restore());

    it.skip("must generate correct query", async () => {
        const insertOneSpy = sandbox.stub(database, "insertOne");

        const simpleModel = new SimpleModel();
        await simpleModel.save();

        const saveData = insertOneSpy.getCall(0).args[0];
        expect(saveData).toEqual({
            id: simpleModel.id,
            enabled: true,
            _id: saveData._id
        });

        expect(saveData._id).toBe(true);

        insertOneSpy.restore();

        simpleModel.name = "test2";
        const updateOneSpy = sandbox.stub(database, "updateOne");
        await simpleModel.save();

        expect(updateOneSpy.getCall(0).args[0]).toEqual({ id: simpleModel.id });
        expect(updateOneSpy.getCall(0).args[1]).toEqual({
            $set: {
                name: "test2",
                slug: "test2"
            }
        });

        updateOneSpy.restore();
    });

    it("should save new model into database and model should receive a new ID", async () => {
        const simpleModel = new SimpleModel();
        await simpleModel.save();

        expect(simpleModel.id.length).toBe(24);
        expect(SimpleModel.isId(simpleModel.id)).toBe(true);
    });

    it("should update existing model", async () => {
        const simpleModel = new SimpleModel();
        await simpleModel.save();

        const newId = simpleModel.id;

        await simpleModel.save();
        expect(simpleModel.id).toBe(newId);
    });
});
