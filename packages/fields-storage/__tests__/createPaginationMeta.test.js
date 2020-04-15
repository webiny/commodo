import { createPaginationMeta, encodeCursor } from "@commodo/fields-storage";

describe("createPaginationMeta test", () => {
    test("should return correct pagination meta data", async () => {
        let meta = createPaginationMeta({
            collection: [{ id: "1" }, { id: "2" }],
            hasNextPage: true,
            hasPreviousPage: false,
            totalCount: 4
        });

        expect(meta).toEqual({
            cursors: {
                next: encodeCursor("2"),
                previous: null
            },
            hasNextPage: true,
            hasPreviousPage: false,
            totalCount: 4
        });

        meta = createPaginationMeta({
            collection: [{ id: "3" }, { id: "4" }],
            hasNextPage: false,
            hasPreviousPage: true,
            totalCount: 4
        });

        expect(meta).toEqual({
            cursors: {
                next: null,
                previous: encodeCursor("3")
            },
            hasNextPage: false,
            hasPreviousPage: true,
            totalCount: 4
        });

        meta = createPaginationMeta({
            collection: [{ id: "2" }, { id: "3" }],
            hasNextPage: true,
            hasPreviousPage: true,
            totalCount: 4
        });

        expect(meta).toEqual({
            cursors: {
                next: encodeCursor("3"),
                previous: encodeCursor("2")
            },
            hasNextPage: true,
            hasPreviousPage: true,
            totalCount: 4
        });
    });
});
