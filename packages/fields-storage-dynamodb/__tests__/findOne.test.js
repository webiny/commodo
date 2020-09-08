import { useModels } from "./models";

describe("find test", function() {
    const { models, getDocumentClient, id: pk } = useModels();

    beforeAll(async () => {
        for (let i = 0; i < 10; i++) {
            await getDocumentClient()
                .put({
                    TableName: "pk-sk",
                    Item: {
                        pk: pk,
                        sk: `something-${i}`,
                        gsi1pk: "gsi1-SimpleModel",
                        gsi1sk: `gsi1-something-${i}`,
                        gsi2pk: "gsi2-SimpleModel",
                        gsi2sk: `gsi2-something-${i}`,
                        name: `Something-${i}`,
                        enabled: true,
                        tags: [i],
                        age: i * 10
                    }
                })
                .promise();
        }
    });

    it("should be able to perform basic findOne queries", async () => {
        const { SimpleModel } = models;

        const something0Entry = await SimpleModel.findOne({
            query: { pk: pk, sk: "something-0" }
        });

        expect(something0Entry.pk).toBe(pk);
        expect(something0Entry.sk).toBe("something-0");
        expect(something0Entry.name).toBe("Something-0");
        expect(something0Entry.enabled).toBe(true);
        expect(something0Entry.tags).toEqual([0]);
        expect(something0Entry.age).toEqual(0);

        const something4Entry = await SimpleModel.findOne({
            query: { pk: pk, sk: "something-4" }
        });

        expect(something4Entry.pk).toBe(pk);
        expect(something4Entry.sk).toBe("something-4");
        expect(something4Entry.name).toBe("Something-4");
        expect(something4Entry.enabled).toBe(true);
        expect(something4Entry.tags).toEqual([4]);
        expect(something4Entry.age).toEqual(40);
    });

    it("should be able to use basic comparison query operators", async () => {
        const { SimpleModel } = models;

        // Should return index 8 instance.
        let somethingEntry = await SimpleModel.findOne({
            query: { pk: pk, sk: { $gte: "something-8" } }
        });

        expect(somethingEntry.pk).toBe(pk);
        expect(somethingEntry.sk).toBe("something-8");
        expect(somethingEntry.name).toBe("Something-8");

        // Should return index 9 instance.

        somethingEntry = await SimpleModel.findOne({
            query: { pk: pk, sk: { $gt: "something-8" } }
        });

        expect(somethingEntry.pk).toBe(pk);
        expect(somethingEntry.sk).toBe("something-9");
        expect(somethingEntry.name).toBe("Something-9");
    });

    it("should be able to use both ascending and descending ordering", async () => {
        const { SimpleModel } = models;

        let result = await SimpleModel.findOne({
            query: { pk, sk: { $beginsWith: "something" } }
        });

        expect(result.sk).toBe("something-0");

        // Let's test descending.
        result = await SimpleModel.findOne({
            query: { pk, sk: { $beginsWith: "something" } },
            sort: { sk: -1 }
        });

        expect(result.sk).toBe("something-9");
    });

    it("should be able query GSIs", async () => {
        const { SimpleModel } = models;

        let result = await SimpleModel.findOne({
            query: { gsi1pk: "gsi1-SimpleModel", gsi1sk: "gsi1-something-3" }
        });

        result.sk = 'something-3';
        result.gsi1sk = 'gsi1-something-3';

        result = await SimpleModel.findOne({
            query: { gsi2pk: "gsi2-SimpleModel", gsi2sk: { $lt: "gsi2-something-3" } }
        });

        result.sk = 'something-2';
        result.gsi1sk = 'gsi1-something-2';
    });
});
