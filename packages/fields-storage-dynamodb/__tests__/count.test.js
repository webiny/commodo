import useModels from "./utils/useModels";
import createSimpleModelsMock from "./mocks/createSimpleModelsMock";

describe("count test", function() {
    const { models, getDynamoDB } = useModels();
    let ddb;
    const TableName = "SimpleModel";
    const { simpleModelsMock } = createSimpleModelsMock();

    beforeAll(async () => {
        ddb = getDynamoDB();

        const promises = simpleModelsMock.map(model => ddb.put({ TableName, Item: model }).promise());
        await Promise.all(promises);
    });


    it("should count models", async () => {
        const count = await models.SimpleModel.count();
        expect(count).toBe(6);
    });

    it("should include search query if passed", async () => {
        const count = await models.SimpleModel.count({
            query: {
                age: { $gt: 30 }
            },
            search: {
                query: "Cloud",
                fields: ["name"]
            }
        });

        expect(count).toBe(1);
    });
});
