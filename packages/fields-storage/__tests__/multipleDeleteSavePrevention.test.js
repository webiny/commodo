import sinon from "sinon";
import { withFields } from "@commodo/fields";
import { withName } from "@commodo/name";
import { compose } from "ramda";
import createModel from "./resources/models/createModel";
import mdbid from "mdbid";

const sandbox = sinon.createSandbox();
const User = compose(withFields({}), withName("User"))(createModel());

describe("multiple delete / save prevention test", () => {
    afterEach(() => sandbox.restore());
    beforeEach(() => User.getStorageCache().flush());

    test("should only call save once", async () => {
        const user = new User();
        const save = sandbox.spy(User.getStorageDriver(), "update");

        const promise = user.save();
        user.save();
        user.save();
        user.save();

        await promise;

        expect(!user.isDirty()).toEqual(true);
        expect(save.callCount).toEqual(0);
    });

    test("should only call delete once", async () => {
        const user = new User();
        user.id = mdbid();

        const deleteOperation = sandbox.spy(User.getStorageDriver(), "delete");

        const promise = user.delete();
        const promise2 = await user.delete();
        await user.delete();
        await user.delete();
        await user.delete();

        await promise;
        await promise2;

        expect(deleteOperation.callCount).toEqual(1);

        user.__withStorage.processing = "delete";
        await user.delete();
        user.__withStorage.processing = null;

        expect(deleteOperation.callCount).toEqual(1);
    });
});
