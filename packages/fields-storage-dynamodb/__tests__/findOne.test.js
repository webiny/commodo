import { useModels } from "./models";

describe("findOne test", function() {
    const { models, getDocumentClient } = useModels();

    it("should be able to use the findOne method", async () => {
        const { SimpleModel } = models;

        for (let i = 0; i < 3; i++) {
            await getDocumentClient()
                .put({
                    TableName: "pk-sk",
                    Item: {
                        pk: `find-one`,
                        sk: String(i),
                        name: `one-${i}`,
                        slug: `one1`,
                        enabled: true,
                        age: i * 10,
                        tags: [i]
                    }
                })
                .promise();
        }

        const model1 = await SimpleModel.findOne({
            query: { pk: `find-one`, sk: String("0") }
        });
    });
});
