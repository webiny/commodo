import { useModels } from "./models";

describe("delete test", () => {
    const { models, getDocumentClient, id: pk } = useModels();

    it("should be able to perform delete operation", async () => {
        const { SimpleModel } = models;

        const simpleModel = new SimpleModel();
        simpleModel.populate({
            pk,
            sk: "something-1",
            name: "Something-1",
            enabled: true,
            tags: ["one", "two", "three"],
            age: 55
        });

        await simpleModel.save();

        let item = await getDocumentClient()
            .get({
                TableName: "pk-sk",
                Key: { pk, sk: "something-1" }
            })
            .promise();

        expect(item).toEqual({
            Item: {
                sk: "something-1",
                name: "Something-1",
                pk,
                slug: "something1",
                enabled: true,
                age: 55,
                tags: ["one", "two", "three"]
            }
        });

        await simpleModel.delete();

        item = await getDocumentClient()
            .get({
                TableName: "pk-sk",
                Key: { pk, sk: "something-1" }
            })
            .promise();

        expect(item).toEqual({});
    });

    it("should be able to perform delete operation and get meta data", async () => {
        const { SimpleModel } = models;

        const simpleModel = new SimpleModel();
        simpleModel.populate({
            pk,
            sk: "something-1",
            name: "Something-1",
            enabled: true,
            tags: ["one", "two", "three"],
            age: 55
        });

        await simpleModel.save();

        const [result, meta] = await simpleModel.delete({ meta: true });

        expect(result).toBe(true);
        expect(meta.operation.response.error).toBeNull();
    });
});
