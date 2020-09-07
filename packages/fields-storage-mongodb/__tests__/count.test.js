import useModels from "./models/useModels";
import createSimpleModelsMock from "./mocks/createSimpleModelsMock";

describe("count test", function() {
    const { models, getCollection } = useModels();
    const { simpleModelsMock } = createSimpleModelsMock();

    beforeAll(() => getCollection("SimpleModel").insertMany(simpleModelsMock));

    it("should count models", async () => {
        const count = await models.SimpleModel.count();
        expect(count).toBe(4);
    });
});
