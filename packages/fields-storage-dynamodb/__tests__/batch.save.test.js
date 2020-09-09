import { useModels } from "./models";
import { Batch } from "@commodo/fields-storage";

describe("batch save test", function() {
    const { models, getDocumentClient, id: pk } = useModels();

    it("should be able to batch save, create, and update calls", async () => {
        const { SimpleModel } = models;

        const a = new SimpleModel().populate({ pk: pk, sk: "a" });
        const b = new SimpleModel().populate({ pk: pk, sk: "b" });
        const c = new SimpleModel().populate({ pk: pk, sk: "c" });

        const batchWriteSpy = jest.spyOn(SimpleModel.getStorageDriver().getClient(), "batchWrite");
        const putSpy = jest.spyOn(SimpleModel.getStorageDriver().getClient(), "put");
        const updateSpy = jest.spyOn(SimpleModel.getStorageDriver().getClient(), "update");

        let batch = new Batch([a, "save"], [b, "save"], [c, "save"]);
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
            Items: [
                { sk: "a", enabled: true, pk: pk },
                { sk: "b", enabled: true, pk: pk },
                { sk: "c", enabled: true, pk: pk }
            ],
            Count: 3,
            ScannedCount: 3
        });

        // Now, try to insert an item via the static "create" method.
        batch = new Batch(
            [SimpleModel, "create", { data: { pk: pk, sk: "d" } }],
            [SimpleModel, "create", { data: { pk: pk, sk: "e" } }],
            [SimpleModel, "create", { data: { pk: pk, sk: "f" } }]
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
            Count: 6,
            Items: [
                {
                    enabled: true,
                    pk: pk,
                    sk: "a"
                },
                {
                    enabled: true,
                    pk: pk,
                    sk: "b"
                },
                {
                    enabled: true,
                    pk: pk,
                    sk: "c"
                },
                {
                    pk: pk,
                    sk: "d"
                },
                {
                    pk: pk,
                    sk: "e"
                },
                {
                    pk: pk,
                    sk: "f"
                }
            ],
            ScannedCount: 6
        });

        // Let's do updates now. First, update a, b, and c instances.
        a.enabled = false;
        b.enabled = false;
        c.enabled = false;

        batch = new Batch([a, "save"], [b, "save"], [c, "save"]);
        await batch.execute();
        expect(batchWriteSpy).toHaveBeenCalledTimes(3);

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
            Count: 6,
            Items: [
                {
                    age: null,
                    enabled: false,
                    name: null,
                    pk: pk,
                    sk: "a",
                    slug: null,
                    tags: null
                },
                {
                    age: null,
                    enabled: false,
                    name: null,
                    pk: pk,
                    sk: "b",
                    slug: null,
                    tags: null
                },
                {
                    age: null,
                    enabled: false,
                    name: null,
                    pk: pk,
                    sk: "c",
                    slug: null,
                    tags: null
                },
                {
                    pk: pk,
                    sk: "d"
                },
                {
                    pk: pk,
                    sk: "e"
                },
                {
                    pk: pk,
                    sk: "f"
                }
            ],
            ScannedCount: 6
        });

        // Once we have that working, let's update d, e, and f items, which were inserted statically.
        batch = new Batch(
            [
                SimpleModel,
                "update",
                {
                    query: { pk: pk, sk: "d" },
                    data: { pk: pk, sk: "d", enabled: false }
                }
            ],
            [
                SimpleModel,
                "update",
                {
                    query: { pk: pk, sk: "e" },
                    data: { pk: pk, sk: "e", enabled: false }
                }
            ],
            [
                SimpleModel,
                "update",
                {
                    query: { pk: pk, sk: "f" },
                    data: { pk: pk, sk: "f", enabled: false }
                }
            ]
        );

        await batch.execute();

        expect(batchWriteSpy).toHaveBeenCalledTimes(4);

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
            Count: 6,
            Items: [
                {
                    age: null,
                    enabled: false,
                    name: null,
                    pk: pk,
                    sk: "a",
                    slug: null,
                    tags: null
                },
                {
                    age: null,
                    enabled: false,
                    name: null,
                    pk: pk,
                    sk: "b",
                    slug: null,
                    tags: null
                },
                {
                    age: null,
                    enabled: false,
                    name: null,
                    pk: pk,
                    sk: "c",
                    slug: null,
                    tags: null
                },
                {
                    pk: pk,
                    sk: "d",
                    enabled: false
                },
                {
                    pk: pk,
                    sk: "e",
                    enabled: false
                },
                {
                    pk: pk,
                    sk: "f",
                    enabled: false
                }
            ],
            ScannedCount: 6
        });

        expect(putSpy).toHaveBeenCalledTimes(0);
        expect(updateSpy).toHaveBeenCalledTimes(0);

        batchWriteSpy.mockRestore();
        putSpy.mockRestore();
        updateSpy.mockRestore();
    });
});
