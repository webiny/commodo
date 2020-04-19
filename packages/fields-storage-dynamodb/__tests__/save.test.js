import useModels from "./utils/useModels";

describe("save test", function() {
    const { models, getDynamoDB } = useModels();
    let ddb;
    const TableName = "SimpleModel";

    beforeAll(() => {
        ddb = getDynamoDB();
    });

    it("must save", async () => {
        const { SimpleModel } = models;
        const simpleModel = new SimpleModel();
        await simpleModel.save();

        let { Items } = await ddb.scan({ TableName }).promise();

        expect(Items).toEqual([{ id: simpleModel.id, enabled: true }]);

        // Update name and save
        simpleModel.name = "test2";
        await simpleModel.save();

        // Load items again and check if the record is updated
        ({ Items } = await ddb.scan({ TableName }).promise());

        expect(items).toEqual([
            { id: simpleModel.id, enabled: true, name: "test2", slug: "test2" }
        ]);
    });

    it("should save a new model and it should receive a new ID", async () => {
        const { SimpleModel } = models;
        const simpleModel = new SimpleModel();
        await simpleModel.save();

        expect(simpleModel.id.length).toBe(24);
        expect(SimpleModel.isId(simpleModel.id)).toBe(true);
    });

    it(`"id" should be the same after update`, async () => {
        const { SimpleModel } = models;
        const simpleModel = new SimpleModel();
        await simpleModel.save();

        const newId = simpleModel.id;

        await simpleModel.save();
        expect(simpleModel.id).toBe(newId);
    });
});
