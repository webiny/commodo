import createModel from "./resources/createModel";
import sinon from "sinon";

const sandbox = sinon.createSandbox();

const Model = createModel();

describe("withSoftDelete test", () => {
    beforeEach(() => Model.getStorageCache().flush());
    afterEach(() => sandbox.restore());

    test(`deleted flag must by default be set to "false"`, async () => {
        const model = new Model();
        expect(model.deleted).toBe(false);
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

        const [item] = await Model.getStorageDriver().database.collection('BlankModel').find({id: model.id});
        expect(item.id).toBe(model.id)
        expect(item.deleted).toBe(true)
    });

    test(`must apply deleted filter to "find" method`, async () => {
        const findSpy = sandbox.spy(Model.getStorageDriver(), "read");
        await Model.find();
        await Model.find({ query: { age: 25 } });
        await Model.find({ sort: { age: -1 } });

        let call = findSpy.getCall(0);
        expect(call.args[0].query).toMatchObject({
            deleted: {
                $ne: true
            }
        });

        call = findSpy.getCall(1);
        expect(call.args[0].query).toMatchObject({
            age: 25,
            deleted: {
                $ne: true
            }
        });

        call = findSpy.getCall(2);
        expect(call.args[0].query).toMatchObject({
            deleted: {
                $ne: true
            }
        });
    });

    test(`must apply deleted filter to "findOne" method`, async () => {
        const findSpy = sandbox.spy(Model.getStorageDriver(), "read");
        await Model.findOne();
        await Model.findOne({ query: { age: 25 } });
        await Model.findOne({ sort: { age: -1 } });

        let call = findSpy.getCall(0);
        expect(call.args[0].query).toEqual({
            deleted: {
                $ne: true
            }
        });

        call = findSpy.getCall(1);
        expect(call.args[0].query).toEqual({
            age: 25,
            deleted: {
                $ne: true
            }
        });

        call = findSpy.getCall(2);
        expect(call.args[0].query).toEqual({
            deleted: {
                $ne: true
            }
        });
    });
});
