import { useModels } from "./models";

describe("save test", function() {
    const { models, getDocumentClient, id: pk } = useModels();

    it("should be able to perform create & update operations", async () => {
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
                pk: pk,
                slug: "something1",
                enabled: true,
                age: 55,
                tags: ["one", "two", "three"]
            }
        });

        simpleModel.name = "Something-1-edited";
        await simpleModel.save();

        item = await getDocumentClient()
            .get({
                TableName: "pk-sk",
                Key: { pk, sk: "something-1" }
            })
            .promise();

        expect(item).toEqual({
            Item: {
                sk: "something-1",
                name: "Something-1-edited",
                pk: pk,
                slug: "something1Edited",
                enabled: true,
                age: 55,
                tags: ["one", "two", "three"]
            }
        });

    });
});
