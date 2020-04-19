import useModels from "./utils/useModels";

describe("dynalite test", () => {
    const TableName = "SimpleModel";
    const { getDynamoDB } = useModels();

    it("should insert item into table", async () => {
        const ddb = getDynamoDB();

        await ddb.put({ TableName, Item: { id: "1", hello: "world" } }).promise();

        const { Item } = await ddb.get({ TableName, Key: { id: "1" } }).promise();

        expect(Item).toEqual({
            id: "1",
            hello: "world"
        });
    });
});
