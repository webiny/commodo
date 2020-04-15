import { useDatabase, createModel, createTestData } from "./utils";
import { encodeCursor } from "@commodo/fields-storage";

describe("Cursor based pagination", () => {
    const db = useDatabase();
    let Model;
    let data;

    beforeAll(async () => {
        Model = await createModel(db.getDatabase());
        data = await createTestData(Model);
    });

    test("Return all records", async () => {
        const args = {};
        const models = await Model.find();
        expect(models.length).toBe(data.length);
    });

    test("Return 5 records", async () => {
        const args = { limit: 5 };
        const models = await Model.find(args);
        expect(models.length).toBe(5);
        expect(models.getMeta()).toMatchObject({
            cursors: {
                next: encodeCursor(data[4].id),
                previous: null
            },
            hasNextPage: true,
            hasPreviousPage: false,
            totalCount: 12
        });
    });

    test("Return second page", async () => {
        const page1Args = { limit: 5 };
        const page1 = await Model.find(page1Args);
        const page1Meta = page1.getMeta();

        const page2Args = { ...page1Args, after: page1Meta.cursors.next };
        const page2 = await Model.find(page2Args);

        expect(page2.length).toBe(5);
        expect(page2.getMeta()).toMatchObject({
            cursors: {
                next: encodeCursor(data[9].id),
                previous: encodeCursor(data[5].id)
            },
            hasNextPage: true,
            hasPreviousPage: true,
            totalCount: 12
        });
    });
});
