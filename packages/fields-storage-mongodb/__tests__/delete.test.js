import useModels from "./models/useModels";
import createSimpleModelsMock from "./mocks/createSimpleModelsMock";

describe("delete test", function() {
    const { models, getCollection } = useModels();
    const { simpleModelsMock, ids } = createSimpleModelsMock();

    beforeAll(() => getCollection("SimpleModel").insertMany(simpleModelsMock));

    it("should delete a record", async () => {
        const id = String(ids[0]);
        let record = await models.SimpleModel.findOne({ query: { id } });
        await record.delete();

        record = await models.SimpleModel.findOne({ query: { id } });
        expect(record).toBeNull();
    });
});
