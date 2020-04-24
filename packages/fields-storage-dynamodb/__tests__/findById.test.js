import useModels from "./utils/useModels";
import createSimpleModelsMock from "./mocks/createSimpleModelsMock";

describe("findById test", function() {
    const { models, getDynamoDB } = useModels();
    let ddb;
    const TableName = "SimpleModel";
    const { simpleModelsMock, ids: [id1, id2, id3, id4, id5, id6] } = createSimpleModelsMock();

    beforeAll(async () => {
        ddb = getDynamoDB();

        const promises = simpleModelsMock.map(model => ddb.put({ TableName, Item: model }).promise());
        await Promise.all(promises);
    });


    it("must find by provided ID correctly", async () => {
        const { SimpleModel } = models;
        let model = await SimpleModel.findById(String(id1));
        expect(model.name).toBe(simpleModelsMock[0].name);

        model = await SimpleModel.findById(String(id2));
        expect(model.name).toBe(simpleModelsMock[1].name);

        model = await SimpleModel.findById(String(id3));
        expect(model.name).toBe(simpleModelsMock[2].name);

        model = await SimpleModel.findById(String(id4));
        expect(model.name).toBe(simpleModelsMock[3].name);

        model = await SimpleModel.findById(String(id5));
        expect(model.name).toBe(simpleModelsMock[4].name);

        model = await SimpleModel.findById(String(id6));
        expect(model.name).toBe(simpleModelsMock[5].name);

        model = await SimpleModel.findById("xyz");
        expect(model).toBe(null);
    });
});
