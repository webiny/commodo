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

    it("should be able to batch find and findOne calls", async () => {
        const { SimpleModel } = models;

        const batch = new Batch(
            [SimpleModel, "find", { query: { pk: pk, sk: "something-1" } }],
            [SimpleModel, "find", { query: { pk: pk, sk: "something-2" } }],
            [SimpleModel, "findOne", { query: { pk: pk, sk: "DOES-NOT-EXIST" } }],
            [SimpleModel, "findOne", { query: { pk: pk, sk: "something-4" } }],
            [SimpleModel, "findOne", { query: { pk: pk, sk: "something-5" } }]
        );

        const batchGetSpy = jest.spyOn(SimpleModel.getStorageDriver().getClient(), "batchGet");
        const results = await batch.execute();
        expect(batchGetSpy).toHaveBeenCalledTimes(1);

        expect(results.length).toBe(5);

        const [r1, r2, r3, r4, r5] = results;
        expect(r1.length).toBe(1);
        expect(r1[0].pk).toBe(pk);
        expect(r1[0].sk).toBe("something-1");

        expect(r2.length).toBe(1);
        expect(r2[0].pk).toBe(pk);
        expect(r2[0].sk).toBe("something-2");

        expect(r3).toBeNull();

        expect(r4.pk).toBe(pk);
        expect(r4.sk).toBe("something-4");

        expect(pk).toBe(pk);
        expect(r5.sk).toBe("something-5");

        batchGetSpy.mockRestore();
    });

    it("should be able to handle errors", async () => {
        const { SimpleModel } = models;

        const batch = new Batch(
            [SimpleModel, "find", { query: { pk: pk, sk: "something-1" } }],
            [SimpleModel, "find", { query: { pk: pk, sk: { $beginsWith: "something-2" } } }],
            [SimpleModel, "find", { query: { pk: pk, sk: "DOES-NOT-EXIST" } }],
            [SimpleModel, "find", { query: { pk: pk, sk: "something-3" } }]
        );

        let error;
        try {
            await batch.execute();
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe(`An error occurred while executing "batchGet" batch operation: Invalid attribute value type`);
    });
});
