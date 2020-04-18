import useModels from "./models/useModels";
import createSimpleModelsMock from "./mocks/createSimpleModelsMock";

describe("findById test", function() {
    const { models, getCollection } = useModels();
    const { simpleModelsMock, ids } = createSimpleModelsMock();
    const [id1, id2, id3, id4] = ids;

    beforeAll(() => getCollection("SimpleModel").insertMany(simpleModelsMock));

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

        model = await SimpleModel.findById("xyz");
        expect(model).toBe(null);
    });
});
