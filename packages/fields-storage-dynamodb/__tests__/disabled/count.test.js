import useModels from "./utils/useModels";
import createSimpleModelsMock from "./mocks/createSimpleModelsMock";

describe("count test", function() {
    const { models, getCollection } = useModels();
    const { simpleModelsMock } = createSimpleModelsMock();

    beforeAll(() => getCollection("SimpleModel").insertMany(simpleModelsMock));

    it("should count models", async () => {
        const count = await models.SimpleModel.count();
        expect(count).toBe(4);
    });

    it("should include search query if passed", async () => {
        const count = await models.SimpleModel.count({
            query: {
                age: { $gt: 30 }
            },
            search: {
                query: "cloud",
                fields: ["name"]
            }
        });

        expect(count).toBe(1);
    });
});
