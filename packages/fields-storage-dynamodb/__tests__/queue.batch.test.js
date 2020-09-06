import { useModels } from "./models";
import { Batch } from "@commodo/fields-storage";

describe("save test", function() {
    const { models, getDocumentClient } = useModels();

    it("should be able to batch save, create, and update calls", async () => {
        const { SimpleModel } = models;

        const a = new SimpleModel().populate({ pk: "SimpleModel", sk: "a" });
        const b = new SimpleModel().populate({ pk: "SimpleModel", sk: "b" });
        const c = new SimpleModel().populate({ pk: "SimpleModel", sk: "c" });

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
                    ":pk": "SimpleModel",
                    ":sk": "a"
                }
            })
            .promise();

        expect(items).toEqual({
            Items: [
                { sk: "a", enabled: true, pk: "SimpleModel" },
                { sk: "b", enabled: true, pk: "SimpleModel" },
                { sk: "c", enabled: true, pk: "SimpleModel" }
            ],
            Count: 3,
            ScannedCount: 3
        });

        // Now, try to insert an item via the static "create" method.
        batch = new Batch(
            [SimpleModel, "create", { data: { pk: "SimpleModel", sk: "d" } }],
            [SimpleModel, "create", { data: { pk: "SimpleModel", sk: "e" } }],
            [SimpleModel, "create", { data: { pk: "SimpleModel", sk: "f" } }]
        );

        await batch.execute();

        expect(batchWriteSpy).toHaveBeenCalledTimes(2);

        items = await getDocumentClient()
            .query({
                TableName: "pk-sk",
                KeyConditionExpression: "pk = :pk and sk >= :sk",
                ExpressionAttributeValues: {
                    ":pk": "SimpleModel",
                    ":sk": "a"
                }
            })
            .promise();

        expect(items).toEqual({
            Count: 6,
            Items: [
                {
                    enabled: true,
                    pk: "SimpleModel",
                    sk: "a"
                },
                {
                    enabled: true,
                    pk: "SimpleModel",
                    sk: "b"
                },
                {
                    enabled: true,
                    pk: "SimpleModel",
                    sk: "c"
                },
                {
                    pk: "SimpleModel",
                    sk: "d"
                },
                {
                    pk: "SimpleModel",
                    sk: "e"
                },
                {
                    pk: "SimpleModel",
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
                    ":pk": "SimpleModel",
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
                    pk: "SimpleModel",
                    sk: "a",
                    slug: null,
                    tags: null
                },
                {
                    age: null,
                    enabled: false,
                    name: null,
                    pk: "SimpleModel",
                    sk: "b",
                    slug: null,
                    tags: null
                },
                {
                    age: null,
                    enabled: false,
                    name: null,
                    pk: "SimpleModel",
                    sk: "c",
                    slug: null,
                    tags: null
                },
                {
                    pk: "SimpleModel",
                    sk: "d"
                },
                {
                    pk: "SimpleModel",
                    sk: "e"
                },
                {
                    pk: "SimpleModel",
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
                    query: { pk: "SimpleModel", sk: "d" },
                    data: { pk: "SimpleModel", sk: "d", enabled: false }
                }
            ],
            [
                SimpleModel,
                "update",
                {
                    query: { pk: "SimpleModel", sk: "e" },
                    data: { pk: "SimpleModel", sk: "e", enabled: false }
                }
            ],
            [
                SimpleModel,
                "update",
                {
                    query: { pk: "SimpleModel", sk: "f" },
                    data: { pk: "SimpleModel", sk: "f", enabled: false }
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
                    ":pk": "SimpleModel",
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
                    pk: "SimpleModel",
                    sk: "a",
                    slug: null,
                    tags: null
                },
                {
                    age: null,
                    enabled: false,
                    name: null,
                    pk: "SimpleModel",
                    sk: "b",
                    slug: null,
                    tags: null
                },
                {
                    age: null,
                    enabled: false,
                    name: null,
                    pk: "SimpleModel",
                    sk: "c",
                    slug: null,
                    tags: null
                },
                {
                    pk: "SimpleModel",
                    sk: "d",
                    enabled: false
                },
                {
                    pk: "SimpleModel",
                    sk: "e",
                    enabled: false
                },
                {
                    pk: "SimpleModel",
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
