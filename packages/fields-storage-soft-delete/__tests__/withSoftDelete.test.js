import createModel from "./resources/createModel";
import sinon from "sinon";

const sandbox = sinon.createSandbox();

const Model = createModel();

describe("withSoftDelete test", () => {
    beforeEach(() => Model.getStoragePool().flush());
    afterEach(() => sandbox.restore());
    test(`deleted flag must by default be set to "false"`, async () => {
        const model = new Model();
        expect(model.deleted).toBe(false);
    });

    test(`must not be able to call delete if not saved previously`, async () => {
        const model = new Model();

        try {
            await model.delete();
        } catch (e) {
            expect(e.message).toBe("Cannot delete before saving to storage.");
        }

        await model.save();
        await model.delete();
    });

    test(`must set deleted "flag" to true after deleting`, async () => {
        const model = new Model();

        expect(model.deleted).toBe(false);
        await model.save();
        await model.delete();
        expect(model.deleted).toBe(true);
    });

    test(`must not call "delete" method on storage driver`, async () => {
        const model = new Model();

        const deleteSpy = sandbox.spy(Model.getStorageDriver(), "delete");
        const updateSpy = sandbox.spy(Model.getStorageDriver(), "update");

        await model.save();
        await model.delete();
        await model.delete();
        await model.delete();
        await model.delete();

        expect(deleteSpy.callCount).toBe(0);
        expect(updateSpy.callCount).toBe(4);

        expect(Model.getStorageDriver().data[model.__withName][model.id].deleted).toBe(true);
    });

    test(`must apply deleted filter to "find" method`, async () => {
        const findSpy = sandbox.spy(Model.getStorageDriver(), "find");
        await Model.find();
        await Model.find({ query: { age: 25 } });
        await Model.find({ sort: { age: -1 } });

        let call = findSpy.getCall(0);
        expect(call.args[0].options).toMatchObject({
            query: {
                deleted: {
                    $ne: true
                }
            }
        });

        call = findSpy.getCall(1);
        expect(call.args[0].options).toMatchObject({
            query: {
                age: 25,
                deleted: {
                    $ne: true
                }
            }
        });

        call = findSpy.getCall(2);
        expect(call.args[0].options).toMatchObject({
            query: {
                deleted: {
                    $ne: true
                }
            },
            sort: { age: -1 }
        });
    });

    test(`must apply deleted filter to "findOne" method`, async () => {
        const findSpy = sandbox.spy(Model.getStorageDriver(), "findOne");
        await Model.findOne();
        await Model.findOne({ query: { age: 25 } });
        await Model.findOne({ sort: { age: -1 } });

        let call = findSpy.getCall(0);
        expect(call.args[0].options).toEqual({
            query: {
                deleted: {
                    $ne: true
                }
            }
        });

        call = findSpy.getCall(1);
        expect(call.args[0].options).toEqual({
            query: {
                age: 25,
                deleted: {
                    $ne: true
                }
            }
        });

        call = findSpy.getCall(2);
        expect(call.args[0].options).toEqual({
            query: {
                deleted: {
                    $ne: true
                }
            },
            sort: { age: -1 }
        });
    });

    test(`must apply deleted filter to "count" method`, async () => {
        const findSpy = sandbox.spy(Model.getStorageDriver(), "count");
        await Model.count();
        await Model.count({ query: { age: 25 } });
        await Model.count({ sort: { age: -1 } });

        let call = findSpy.getCall(0);
        expect(call.args[0].options).toEqual({
            query: {
                deleted: {
                    $ne: true
                }
            }
        });

        call = findSpy.getCall(1);
        expect(call.args[0].options).toEqual({
            query: {
                age: 25,
                deleted: {
                    $ne: true
                }
            }
        });

        call = findSpy.getCall(2);
        expect(call.args[0].options).toEqual({
            query: {
                deleted: {
                    $ne: true
                }
            },
            sort: { age: -1 }
        });
    });
});
