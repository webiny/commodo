import useModels from "./utils/useModels";
import createSimpleModelsMock from "./mocks/createSimpleModelsMock";

describe("findOne test", function() {
    const { models, getDynamoDB } = useModels();
    let ddb;
    const TableName = "SimpleModel";
    const { simpleModelsMock, ids: [id1, , id3, id4] } = createSimpleModelsMock();

    beforeAll(async () => {
        ddb = getDynamoDB();

        const promises = simpleModelsMock.map(model => ddb.put({ TableName, Item: model }).promise());
        await Promise.all(promises);
    });

    it("must find one correctly", async () => {
        const { SimpleModel } = models;

        // Simple queries.
        let model = await SimpleModel.findOne({ query: { id: String(id1) } });
        expect(model.id).toBe(String(id1));

        model = await SimpleModel.findOne({ query: { name: "Amazon Web Services" } });
        expect(model.id).toBe(String(id1));

        model = await SimpleModel.findOne({ query: { name: "one-xyz" } });
        expect(model).toBe(null);

        model = await SimpleModel.findOne({ query: { enabled: false } });
        expect(model.id).not.toBeNull();

        model = await SimpleModel.findOne({ query: { tags: { $in: ["purple"] } } });
        expect(model.id).toBe(String(id4));

        // Query - search query should be passed.
        model = await SimpleModel.findOne({
            query: {
                age: { $gte: 40 }
            },
            search: {
                query: "thr3ee",
                fields: ["name"]
            }
        });

        expect(model).toBe(null);

        model = await SimpleModel.findOne({
            query: {
                age: { $gte: 40 }
            },
            search: {
                query: "three",
                fields: ["name"]
            }
        });

        expect(model).toBe(null);

        model = await SimpleModel.findOne({
            query: {
                age: { $gt: 25 }
            },
            search: {
                query: "Lambda",
                fields: ["name"]
            }
        });

        expect(model.id).toBe(String(id3));

        model = await SimpleModel.findOne({
            query: {
                age: { $gt: 25 }
            },
            search: {
                query: "th1ree",
                fields: ["name"]
            }
        });

        expect(model).toBe(null);
    });

    it("should correctly apply search params", async () => {
        const { SimpleModel } = models;

        // Simple queries.
        let model = await SimpleModel.findOne({ query: { id: String(id1) } });
        expect(model.id).toBe(String(id1));

        model = await SimpleModel.findOne({ query: { name: "Amazon Web Services" } });
        expect(model.id).toBe(String(id1));

        model = await SimpleModel.findOne({ query: { name: "one-xyz" } });
        expect(model).toBe(null);

        model = await SimpleModel.findOne({ query: { enabled: false } });
        expect(model.id).toBe(String(id3));

        // TODO: fix save array   tags: [],
        model = await SimpleModel.findOne({ query: { tags: { $in: ["purple"] } } });
        expect(model.id).toBe(String(id4));

        // Query - search query should be passed.
        model = await SimpleModel.findOne({
            query: {
                age: { $gte: 40 }
            },
            search: {
                query: "thr3ee",
                fields: ["name"]
            }
        });

        expect(model).toBe(null);

        model = await SimpleModel.findOne({
            query: {
                age: { $gte: 40 }
            },
            search: {
                query: "three",
                fields: ["name"]
            }
        });

        expect(model).toBe(null);

        model = await SimpleModel.findOne({
            query: {
                age: { $gt: 25 }
            },
            search: {
                query: "Lambda",
                fields: ["name"]
            }
        });

        expect(model.id).toBe(String(id3));

        model = await SimpleModel.findOne({
            query: {
                age: { $gt: 25 }
            },
            search: {
                query: "th1ree",
                fields: ["name"]
            }
        });

        expect(model).toBe(null);
    });
});
