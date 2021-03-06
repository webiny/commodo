import sinon from "sinon";
import mdbid from "mdbid";
import User from "./resources/models/User";

const sandbox = sinon.createSandbox();

describe("find test", () => {
    afterEach(() => sandbox.restore());

    test("find - must return a Collection / results with meta data", async () => {
        const A = mdbid();
        const B = mdbid();
        const C = mdbid();

        const findStub = sandbox.stub(User.getStorageDriver(), "find").callsFake(() => {
            return [
                [
                    {
                        id: A,
                        age: 11,
                        enabled: true
                    },
                    {
                        id: B,
                        age: 12,
                        enabled: false
                    },
                    {
                        id: C,
                        age: 13,
                        enabled: false
                    }
                ],

                {
                    cursors: {
                        next: null,
                        previous: null
                    },
                    hasNextPage: null,
                    hasPreviousPage: null,
                    totalCount: 3
                }
            ];
        });

        const results = await User.find({ totalCount: true });
        findStub.restore();

        expect(results.length).toBe(3);
        expect(results.getMeta()).toEqual({
            cursors: {
                next: null,
                previous: null
            },
            hasNextPage: false,
            hasPreviousPage: false,
            totalCount: 3
        });
    });

    test("find - must NOT throw an error if storage data is invalid", async () => {
        const findStub = sandbox.stub(User.getStorageDriver(), "find").callsFake(() => {
            return [
                [
                    {
                        id: mdbid(),
                        enabled: 123
                    }
                ]
            ];
        });

        await User.find();
        findStub.restore();
    });
});
