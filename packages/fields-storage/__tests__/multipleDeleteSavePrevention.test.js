import sinon from "sinon";
const sandbox = sinon.createSandbox();
import { withFields } from "@commodo/fields";
import { withName } from "@commodo/name";
import { compose } from "ramda";
import createModel from "./resources/models/createModel";

const User = compose(
    withFields({}),
    withName("User")
)(createModel());

describe("multiple delete / save prevention test", () => {
    afterEach(() => sandbox.restore());
    beforeEach(() => User.getStoragePool().flush());

    test("should only call save once", async () => {
        const user = new User();
        const save = sandbox.spy(User.getStorageDriver(), "save");

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
        user.id = "asd";

        const deleteOperation = sandbox.spy(User.getStorageDriver(), "delete");

        const promise = user.delete();
        const promise2 = await user.delete();
        await user.delete();
        await user.delete();
        await user.delete();

        await promise;
        await promise2;

        expect(deleteOperation.callCount).toEqual(1);

        user.__storage.processing = "delete";
        await user.delete();
        user.__storage.processing = null;

        expect(deleteOperation.callCount).toEqual(1);
    });
});
