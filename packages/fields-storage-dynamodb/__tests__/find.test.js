import { useModels } from "./models";

describe("find test", function() {
    const { models, getDocumentClient, id: pk } = useModels();

    beforeEach(async () => {
        for (let i = 0; i < 10; i++) {
            await getDocumentClient()
                .put({
                    TableName: "pk-sk",
                    Item: {
                        pk,
                        sk: `something-${i}`,
                        gsi1pk: `gsi1-${pk}`,
                        gsi1sk: `gsi1-something-${i}`,
                        gsi2pk: `gsi2-${pk}`,
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

    it("should be able to perform basic find queries", async () => {
        const { SimpleModel } = models;

        const [something0Entry] = await SimpleModel.find({
            query: { pk, sk: "something-0" }
        });

        expect(something0Entry.pk).toBe(pk);
        expect(something0Entry.sk).toBe("something-0");
        expect(something0Entry.name).toBe("Something-0");
        expect(something0Entry.enabled).toBe(true);
        expect(something0Entry.tags).toEqual([0]);
        expect(something0Entry.age).toEqual(0);

        const [something4Entry] = await SimpleModel.find({
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

        // Should return two instances using the $gte operator.
        let results = await SimpleModel.find({
            query: { pk: pk, sk: { $gte: "something-8" } }
        });

        expect(results[0].pk).toBe(pk);
        expect(results[0].sk).toBe("something-8");
        expect(results[0].name).toBe("Something-8");

        expect(results[1].pk).toBe(pk);
        expect(results[1].sk).toBe("something-9");
        expect(results[1].name).toBe("Something-9");

        // Should return 9 instances (zero-indexed item not included in the result set).
        results = await SimpleModel.find({
            query: { pk: pk, sk: { $gt: "something-0" } }
        });

        expect(results.length).toBe(9);

        // Should return 10 instances (all items included in the result set).
        results = await SimpleModel.find({
            query: { pk: pk, sk: { $gte: "something-0" } }
        });

        expect(results.length).toBe(10);
    });

    it("should be able to use both ascending and descending ordering", async () => {
        // TODO
    });

    it("should be able to apply limits", async () => {
        const { SimpleModel } = models;

        let results = await SimpleModel.find({
            limit: 3,
            query: { pk: pk, sk: { $beginsWith: "something" } }
        });

        expect(results[0].sk).toBe("something-0");
        expect(results[2].sk).toBe("something-2");
    });

    it("should be able to paginate results", async () => {
        // TODO:
    });

    it("should be able query GSIs", async () => {
        const { SimpleModel } = models;

        let results = await SimpleModel.find({
            query: { gsi1pk: "gsi1-SimpleModel", gsi1sk: { $beginsWith: "gsi1-something" } }
        });

        expect(results.length).toBe(10);

        expect(results[0].sk).toBe("something-0");
        expect(results[2].sk).toBe("something-2");
        expect(results[9].sk).toBe("something-9");

        results = await SimpleModel.find({
            query: { gsi2pk: "gsi2-SimpleModel", gsi2sk: { $lte: "gsi2-something-3" } }
        });

        expect(results.length).toBe(4);

        expect(results[0].sk).toBe("something-0");
        expect(results[2].sk).toBe("something-2");
        expect(results[3].sk).toBe("something-3");
    });
});
