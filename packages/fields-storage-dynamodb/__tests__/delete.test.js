import { useModels } from "./models";
import { getName } from "@commodo/name";

describe("delete test", function() {
    const { models, getDocumentClient } = useModels();

    it("should be able to perform create & update operations", async () => {
        const { SimpleModel } = models;
        const simpleModel = new SimpleModel();
        simpleModel.populate({
            pk: getName(SimpleModel),
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
                Key: { pk: getName(SimpleModel), sk: "something-1" }
            })
            .promise();

        expect(item).toEqual({
            Item: {
                sk: "something-1",
                name: "Something-1",
                pk: "SimpleModel",
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
                Key: { pk: getName(SimpleModel), sk: "something-1" }
            })
            .promise();

        expect(item).toEqual({
            Item: {
                sk: "something-1",
                name: "Something-1-edited",
                pk: "SimpleModel",
                slug: "something1Edited",
                enabled: true,
                age: 55,
                tags: ["one", "two", "three"]
            }
        });

    });
});
