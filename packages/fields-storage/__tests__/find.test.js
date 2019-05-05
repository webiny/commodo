import sinon from "sinon";
import User from "./resources/models/User";
import mdbid from "mdbid";

const sandbox = sinon.createSandbox();

describe("find test", function() {
    afterEach(() => sandbox.restore());

    it("find - must return a Collection / results with meta data", async () => {
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
                    page: 1,
                    perPage: 10,
                    totalCount: 3,
                    totalPages: 1,
                    from: 1,
                    to: 3,
                    nextPage: null,
                    previousPage: null,
                    meta: undefined
                }
            ];
        });

        const results = await User.find();
        findStub.restore();

        expect(results.length).toBe(3);
        expect(results.getMeta()).toEqual({
            page: 1,
            perPage: 10,
            totalCount: 3,
            totalPages: 1,
            from: 1,
            to: 3,
            nextPage: null,
            previousPage: null,
            meta: undefined
        });
    });

    it("find - must throw an error if storage data is invalid", async () => {
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

        try {
            await User.find();
        } catch (e) {
            expect(e.message).toBe(
                'Invalid data type: boolean field "enabled" cannot accept value 123.'
            );
            return;
        } finally {
            findStub.restore();
        }

        throw Error(`Error should've been thrown.`);
    });
});
