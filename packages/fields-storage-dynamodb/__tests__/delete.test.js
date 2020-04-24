import { WithStorageError } from "@commodo/fields-storage";
import useModels from "./utils/useModels";
import createSimpleModelsMock from "./mocks/createSimpleModelsMock";

describe("delete test", function() {
    const { models, getDynamoDB } = useModels();
    let ddb;
    const TableName = "SimpleModel";
    const { simpleModelsMock, ids: [id1] } = createSimpleModelsMock();

    beforeAll(async () => {
        ddb = getDynamoDB();

        const promises = simpleModelsMock.map(model => ddb.put({ TableName, Item: model }).promise());
        await Promise.all(promises);
    });

    it("should delete a record", async () => {
        const id = String(id1);
        let record = await models.SimpleModel.findById(id);
        await record.delete();

        record = await models.SimpleModel.findById(id);
        expect(record).toBeNull();
    });

    it("should throw an exception because model was not previously saved", async () => {
        try {
            const simpleModel = new models.SimpleModel();
            await simpleModel.delete();
        } catch (e) {
            expect(e.code).toBe(WithStorageError.CANNOT_DELETE_NO_ID);
            return;
        }
        throw Error(`Error should've been thrown.`);
    });
});
