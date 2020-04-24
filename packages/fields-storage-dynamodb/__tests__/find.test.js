import useModels from "./utils/useModels";
import createSimpleModelsMock from "./mocks/createSimpleModelsMock";

describe("find test", function() {
    const { models, getDynamoDB } = useModels();
    let ddb;
    const TableName = "SimpleModel";
    const { simpleModelsMock } = createSimpleModelsMock();

    beforeAll(async () => {
        ddb = getDynamoDB();

        const promises = simpleModelsMock.map(model => ddb.put({ TableName, Item: model }).promise());
        await Promise.all(promises);
    });

    it("should find all models", async () => {
        const records = await models.SimpleModel.find();

        expect(records.length).toBe(6);
    });

    it("should find models using limit", async () => {
        const records = await models.SimpleModel.find({ limit: 2 });

        expect(records.length).toBe(2);
    });

    it("should find models using query", async () => {
        const records = await models.SimpleModel.find({
            query: {
                enabled: true
            }
        });

        expect(records.length).toBe(4);
    });

    it("should find models using query and search", async () => {
        const records = await models.SimpleModel.find({
            query: {
                age: { $gt: 10 }
            },
            search: {
                query: "serverless",
                fields: ["name", "slug"],
                operator: "or"
            }
        });

        expect(records.length).toBe(1);
    });
});
