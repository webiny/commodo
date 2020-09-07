import useModels from "./models/useModels";
import createSimpleModelsMock from "./mocks/createSimpleModelsMock";

describe("findOne test", function() {
    const { models, getCollection } = useModels();
    const { simpleModelsMock, ids } = createSimpleModelsMock();
    const [id1, , id3, id4] = ids;

    beforeAll(() => getCollection("SimpleModel").insertMany(simpleModelsMock));

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
        expect(model.id).toBe(String(id3));

        model = await SimpleModel.findOne({ query: { tags: { $in: ["purple"] } } });
        expect(model.id).toBe(String(id4));

        // Query with sorting.
        model = await SimpleModel.findOne({
            query: { tags: { $in: ["blue"] } },
            sort: { name: -1 }
        });
        expect(model.id).toBe(String(id4));
    });
});
