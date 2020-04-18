import useModels from "./models/useModels";
import createSimpleModelsMock from "./mocks/createSimpleModelsMock";

describe("search test", () => {
    const { models, getCollection } = useModels();

    const { simpleModelsMock, ids } = createSimpleModelsMock();

    beforeAll(async () => {
        await getCollection("SimpleModel").insertMany(simpleModelsMock);
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

    it("must apply search, query and sort", async () => {
        const results = await models.SimpleModel.find({
            query: { age: { $lte: 30 } },
            sort: { age: -1 },
            search: {
                query: "serverless",
                fields: ["name", "slug"],
                operator: "or"
            }
        });

        expect(results.length).toBe(2);
        expect(results[0].id).toBe(ids[2].toString());
    });
});
