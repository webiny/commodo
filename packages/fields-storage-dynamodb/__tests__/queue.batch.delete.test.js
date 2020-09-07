import { useModels } from "./models";
import { Batch } from "@commodo/fields-storage";

describe("batch save test", function() {
    const { models, getDocumentClient, id: pk } = useModels();

    beforeAll(async () => {
        for (let i = 0; i < 6; i++) {
            await getDocumentClient()
                .put({
                    TableName: "pk-sk",
                    Item: {
                        pk: pk,
                        sk: `something-${i}`
                    }
                })
                .promise();
        }
    });

    it("should be able to batch save, create, and update calls", async () => {
        const { SimpleModel } = models;

        const a = new SimpleModel().populate({ pk: pk, sk: "something-0" });
        const b = new SimpleModel().populate({ pk: pk, sk: "something-1" });
        const c = new SimpleModel().populate({ pk: pk, sk: "something-2" });

        const batchWriteSpy = jest.spyOn(SimpleModel.getStorageDriver().getClient(), "batchWrite");
        const deleteSpy = jest.spyOn(SimpleModel.getStorageDriver().getClient(), "delete");

        let batch = new Batch([a, "delete"], [b, "delete"], [c, "delete"]);
        await batch.execute();

        expect(batchWriteSpy).toHaveBeenCalledTimes(1);

        let items = await getDocumentClient()
            .query({
                TableName: "pk-sk",
                KeyConditionExpression: "pk = :pk and sk >= :sk",
                ExpressionAttributeValues: {
                    ":pk": pk,
                    ":sk": "a"
                }
            })
            .promise();

        expect(items).toEqual({
            "Count": 3,
            "Items": [
                {
                    "pk": pk,
                    "sk": "something-3"
                },
                {
                    "pk": pk,
                    "sk": "something-4"
                },
                {
                    "pk": pk,
                    "sk": "something-5"
                }
            ],
            "ScannedCount": 3
        });

        // Now, try to insert an item via the static "create" method.
        batch = new Batch(
            [SimpleModel, "delete", { query: { pk: pk, sk: "something-3" } }],
            [SimpleModel, "delete", { query: { pk: pk, sk: "something-4" } }],
            [SimpleModel, "delete", { query: { pk: pk, sk: "something-5" } }]
        );

        await batch.execute();

        expect(batchWriteSpy).toHaveBeenCalledTimes(2);

        items = await getDocumentClient()
            .query({
                TableName: "pk-sk",
                KeyConditionExpression: "pk = :pk and sk >= :sk",
                ExpressionAttributeValues: {
                    ":pk": pk,
                    ":sk": "a"
                }
            })
            .promise();

        expect(items).toEqual({
            "Count": 0,
            "Items": [],
            "ScannedCount": 0
        });

        expect(deleteSpy).toHaveBeenCalledTimes(0);

        batchWriteSpy.mockRestore();
        deleteSpy.mockRestore();
    });
});
