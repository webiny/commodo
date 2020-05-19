import useModels from "./models/useModels";
import createSimpleModelsMock from "./mocks/createSimpleModelsMock";

describe("find test", function() {
    const { models, getCollection } = useModels();
    const { simpleModelsMock, ids } = createSimpleModelsMock();

    beforeAll(() => getCollection("SimpleModel").insertMany(simpleModelsMock));

    it("should find all models", async () => {
        const records = await models.SimpleModel.find();

        expect(records.length).toBe(4);
    });

    it("should find models using limit", async () => {
        const records = await models.SimpleModel.find({ limit: 2 });

        expect(records.length).toBe(2);
    });

    it("should find models using sort, limit and offset", async () => {
        const stringIds = ids.map(x => String(x));
        const records = await models.SimpleModel.find({
            sort: { age: 1 },
            limit: 2,
            offset: 2
        });

        expect(records.length).toBe(2);
        expect(records[0].id).toBe(stringIds[2]);
        expect(records[1].id).toBe(stringIds[3]);
    });

    it("should find models using query and sort", async () => {
        const stringIds = ids.map(x => String(x));
        const records = await models.SimpleModel.find({
            sort: { slug: -1 },
            query: {
                enabled: true
            }
        });

        expect(records.length).toBe(3);
        expect(records[0].id).toBe(stringIds[1]);
        expect(records[1].id).toBe(stringIds[3]);
        expect(records[2].id).toBe(stringIds[0]);
    });

    it("should find models using query, sort and search", async () => {
        const stringIds = ids.map(x => String(x));
        const records = await models.SimpleModel.find({
            sort: { slug: 1 },
            query: {
                age: { $gt: 10 }
            },
            search: {
                query: "serverless",
                fields: ["name", "slug"],
                operator: "or"
            }
        });

        expect(records.length).toBe(2);
        expect(records[0].id).toBe(stringIds[1]);
        expect(records[1].id).toBe(stringIds[2]);
    });

    it("should return only specified fields", async () => {
        const [records] = await models.SimpleModel.getStorageDriver().find({
            name: "SimpleModel",
            options: {
                limit: 1,
                fields: ["name", "slug"]
            }
        });

        expect(records.length).toBe(1);
        expect(Object.keys(records[0])).toStrictEqual(["_id", "id", "name", "slug"]);
    });
});
