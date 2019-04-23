import { User, Group, UsersGroups } from "../../../../resources/models/modelsUsing";
import sinon from "sinon";
import { MainEntity } from "../../../../resources/models/modelsAttributeModels";
import mdbid from "mdbid";

const sandbox = sinon.createSandbox();

describe("attribute models (using an additional aggregation class) - loading test", () => {
    afterEach(() => sandbox.restore());
    beforeEach(() => MainEntity.getStoragePool().flush());

    test("should correctly set model and link (class and attributes)", async () => {
        const user = new User();
        const classes = user.getField("groups").classes;
        expect(classes).toEqual({
            models: {
                field: "user",
                class: Group
            },
            parent: "User",
            using: {
                field: "group",
                class: UsersGroups
            }
        });
    });

    test("should load links and models correctly", async () => {
        const A = mdbid();

        let modelFindById = sandbox
            .stub(User.getStorageDriver(), "findOne")
            .callsFake(() => ({ id: A }));
        const user = await User.findById(A);
        modelFindById.restore();

        expect(user.getField("groups").initial).toHaveLength(0);
        expect(user.getField("groups").current).toHaveLength(0);

        const X = mdbid();
        const Y = mdbid();
        const Z = mdbid();

        const first = mdbid();
        const second = mdbid();
        const third = mdbid();
        const modelFind = sandbox.stub(UsersGroups.getStorageDriver(), "find").callsFake(() => {
            return [
                [
                    { id: first, user: A, group: X },
                    { id: second, user: A, group: Y },
                    { id: third, user: A, group: Z }
                ]
            ];
        });

        modelFindById = sandbox
            .stub(Group.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: X, name: "Group X" };
            })
            .onCall(1)
            .callsFake(() => {
                return { id: Y, name: "Group Y" };
            })
            .onCall(2)
            .callsFake(() => {
                return { id: Z, name: "Group Z" };
            });

        const groups = await user.groups;

        expect(modelFind.callCount).toEqual(1);
        expect(modelFindById.callCount).toEqual(3);

        expect(user.getField("groups").initial).toHaveLength(3);
        expect(user.getField("groups").initial[0].id).toEqual(X);
        expect(user.getField("groups").initial[1].id).toEqual(Y);
        expect(user.getField("groups").initial[2].id).toEqual(Z);
        expect(user.getField("groups").current).toHaveLength(3);

        expect(groups[0].id).toEqual(X);
        expect(groups[1].id).toEqual(Y);
        expect(groups[2].id).toEqual(Z);

        expect(user.getField("groups").links.initial).toHaveLength(3);
        expect(user.getField("groups").links.initial[0].id).toEqual(first);
        expect(user.getField("groups").links.initial[1].id).toEqual(second);
        expect(user.getField("groups").links.initial[2].id).toEqual(third);

        expect(user.getField("groups").links.current[0].id).toEqual(first);
        expect(user.getField("groups").links.current[1].id).toEqual(second);
        expect(user.getField("groups").links.current[2].id).toEqual(third);

        modelFind.restore();
    });

    test("should not load if values are already set", async () => {
        const user = new User();
        const modelSave = sandbox.spy(UsersGroups.getStorageDriver(), "save");
        const modelFind = sandbox.spy(UsersGroups.getStorageDriver(), "find");
        const modelFindById = sandbox.spy(UsersGroups.getStorageDriver(), "findOne");
        await user.groups;

        expect(modelSave.callCount).toEqual(0);
        expect(modelFind.callCount).toEqual(0);
        expect(modelFindById.callCount).toEqual(0);

        await user.save();

        expect(modelSave.callCount).toEqual(0);
        expect(modelFind.callCount).toEqual(0);
        expect(modelFindById.callCount).toEqual(0);

        await user.save();
        expect(modelSave.callCount).toEqual(0);
        expect(modelFind.callCount).toEqual(0);
        expect(modelFindById.callCount).toEqual(0);

        await user.save();
        expect(modelSave.callCount).toEqual(0);
        expect(modelFind.callCount).toEqual(0);
        expect(modelFindById.callCount).toEqual(0);

        await user.groups;
        await user.save();

        expect(modelSave.callCount).toEqual(0);
        expect(modelFind.callCount).toEqual(0);
        expect(modelFindById.callCount).toEqual(0);

        const user2 = new User();

        await user2.save();
        expect(modelSave.callCount).toEqual(0);
        expect(modelFind.callCount).toEqual(0);
        expect(modelFindById.callCount).toEqual(0);

        await user2.save();
        expect(modelSave.callCount).toEqual(0);
        expect(modelFind.callCount).toEqual(0);
        expect(modelFindById.callCount).toEqual(0);

        await user2.getField('groups').getValue();
        await user2.save();

        expect(modelSave.callCount).toEqual(0);
        expect(modelFind.callCount).toEqual(1);
        expect(modelFindById.callCount).toEqual(0);

        // 'firstName' attribute doesn't exist, so save shouldn't still do anything - model is still clean.
        user2.firstName = "test";
        await user2.save();

        await user2.groups;

        expect(modelSave.callCount).toEqual(0);
        expect(modelFind.callCount).toEqual(1);
        expect(modelFindById.callCount).toEqual(0);

        const user3 = new User();
        user3.name = "test";
        await user3.save();

        await user3.groups;

        expect(modelSave.callCount).toEqual(1);
        expect(modelFind.callCount).toEqual(2);
        expect(modelFindById.callCount).toEqual(0);

        modelSave.restore();
        modelFind.restore();
        modelFindById.restore();
    });
});
