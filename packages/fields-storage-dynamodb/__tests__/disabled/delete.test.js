import { WithStorageError } from "@commodo/fields-storage";
import useModels from "./utils/useModels";
import createSimpleModelsMock from "./mocks/createSimpleModelsMock";

describe("delete test", function() {
    const { models, getCollection } = useModels();
    const { simpleModelsMock, ids } = createSimpleModelsMock();

    beforeAll(() => getCollection("SimpleModel").insertMany(simpleModelsMock));

    it("should delete a record", async () => {
        const id = String(ids[0]);
        let record = await models.SimpleModel.findById(id);
        await record.delete();

        record = await models.SimpleModel.findById(id);
        expect(record).toBeNull();
    });

    it("should throw an exception because model was not previously saved", async () => {
        try {
            const simpleModel = new models.SimpleModel();
            await simpleModel.delete();
        } catch (e) {
            expect(e.code).toBe(WithStorageError.CANNOT_DELETE_NO_ID);
            return;
        }
        throw Error(`Error should've been thrown.`);
    });
});
