import useModels from "./utils/useModels";
import createSimpleModelsMock from "./mocks/createSimpleModelsMock";

describe("search test", () => {
    const { models, getDynamoDB } = useModels();
    let ddb;
    const TableName = "SimpleModel";
    const { simpleModelsMock } = createSimpleModelsMock();

    beforeAll(async () => {
        ddb = getDynamoDB();

        const promises = simpleModelsMock.map(model => ddb.put({ TableName, Item: model }).promise());
        await Promise.all(promises);
    });

    beforeEach(() => models.SimpleModel.getStoragePool().flush());

    it("should search models with $or operator", async () => {
        const records = await models.SimpleModel.find({
            search: {
                query: "serverless",
                fields: ["name", "slug"]
            }
        });


        expect(records.length).toBe(2);
    });

    it("should search models with $and operator", async () => {
        const records = await models.SimpleModel.find({
            search: {
                query: "cloud",
                fields: ["name", "slug"],
                operator: "and"
            }
        });

        expect(records.length).toBe(1);
    });

    it("should search models over only one column", async () => {
        const records = await models.SimpleModel.find({
            search: {
                query: "Amazon",
                fields: ["name"]
            }
        });

        expect(records.length).toBe(1);
    });

    it("should use search and combine it with other sent query parameters", async () => {
        const results = await models.SimpleModel.find({
            search: {
                query: "serverless",
                fields: ["name", "slug"]
            },
            query: {
                age: { $gte: 30 }
            }
        });

        expect(results.length).toBe(1);
    });
});
