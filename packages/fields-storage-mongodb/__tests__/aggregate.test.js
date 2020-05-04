import useModels from "./models/useModels";
import createSimpleModelsMock from "./mocks/createSimpleModelsMock";
import { withAggregate } from "@commodo/fields-storage-mongodb";

describe("aggregate test", function() {
    const { models, getCollection } = useModels();
    const { simpleModelsMock } = createSimpleModelsMock();

    beforeAll(() => getCollection("SimpleModel").insertMany(simpleModelsMock));

    it("must return correct records", async () => {
        const SimpleModelWithAggregate = withAggregate()(models.SimpleModel);
        const result = await SimpleModelWithAggregate.aggregate([
            { $match: { age: { $gt: 10 } } },
            { $limit: 2 }
        ]);
        expect(result.length).toBe(2);
    });
});
