import { User, Group, UsersGroups } from "../../../../resources/models/modelsUsing";
import { UserDynamic } from "../../../../resources/models/modelsUsingDynamic";
import sinon from "sinon";
import { MainEntity } from "../../../../resources/models/modelsAttributeModels";
import mdbid from "mdbid";

const sandbox = sinon.createSandbox();

describe("attribute models (using an additional aggregation class) - saving test", () => {
    afterEach(() => sandbox.restore());
    beforeEach(() => MainEntity.getStoragePool().flush());

    const A = mdbid();
    const X = mdbid();
    const Y = mdbid();
    const Z = mdbid();
    const P = mdbid();
    const Q = mdbid();

    const usersGroups = {
        first: mdbid(),
        second: mdbid(),
        third: mdbid(),
        fourth: mdbid(),
        fifth: mdbid(),
        sixth: mdbid(),
        seventh: mdbid(),
        eighth: mdbid()
    };

    test("should assign existing values correctly and track links that need to be deleted on consequent save method calls", async () => {
        let modelFindById = sandbox
            .stub(User.getStorageDriver(), "findOne")
            .callsFake(() => ({ id: A }));
        const user = await User.findById(A);
        modelFindById.restore();

        sandbox.stub(UsersGroups.getStorageDriver(), "find").callsFake(() => {
            return [
                [
                    { id: usersGroups.first, user: A, group: X },
                    { id: usersGroups.second, user: A, group: Y },
                    { id: usersGroups.third, user: A, group: Z }
                ]
            ];
        });

        sandbox
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

        user.groups = [{ name: "Group P" }, { name: "Group Q" }];

        expect(user.getField("groups").initial).toHaveLength(0);
        expect(user.getField("groups").current).toHaveLength(2);
        expect(user.getField("groups").current[0].name).toEqual("Group P");
        expect(user.getField("groups").current[1].name).toEqual("Group Q");

        expect(user.getField("groups").links.initial).toHaveLength(0);
        expect(user.getField("groups").links.current).toHaveLength(0);

        let modelSave = sandbox
            .stub(user.getStorageDriver(), "save")
            .onCall(0)
            .callsFake(() => {
                return true;
            })
            .onCall(1)
            .callsFake(({ model }) => {
                model.id = P;
                return true;
            })
            .onCall(2)
            .callsFake(({ model }) => {
                model.id = usersGroups.fourth;
                return true;
            })
            .onCall(3)
            .callsFake(({ model }) => {
                model.id = Q;
                return true;
            })
            .onCall(4)
            .callsFake(({ model }) => {
                model.id = usersGroups.fifth;
                return true;
            });

        await user.save();

        modelSave.restore();

        expect(modelSave.callCount).toEqual(5);

        expect(user.getField("groups").initial).toHaveLength(2);
        expect(user.getField("groups").initial[0].id).toEqual(P);
        expect(user.getField("groups").initial[1].id).toEqual(Q);
        expect(user.getField("groups").current).toHaveLength(2);
        expect(user.getField("groups").current[0].id).toEqual(P);
        expect(user.getField("groups").current[1].id).toEqual(Q);

        expect(user.getField("groups").links.initial).toHaveLength(2);
        expect(user.getField("groups").links.initial[0].id).toEqual(usersGroups.fourth);
        expect(user.getField("groups").links.initial[1].id).toEqual(usersGroups.fifth);

        expect(user.getField("groups").links.current).toHaveLength(2);
        expect(user.getField("groups").links.current[0].id).toEqual(usersGroups.fourth);
        expect(user.getField("groups").links.current[1].id).toEqual(usersGroups.fifth);

        // Let's try to add values using push.
        const groups = await user.groups;

        const I = mdbid();
        const J = mdbid();

        groups.push(new Group().populate({ id: I, name: "Group I" }));
        groups.push(new Group().populate({ name: "Group J" }));
        groups.push(new Group().populate({ id: I, name: "Group I" }));

        user.groups = groups;

        // Here we care only for save calls that actually created an ID, we don't care about updates. We should have
        // four saves: link for 1st item, link and the item itself for 2nd, and again only link for the last item.
        modelSave = sandbox
            .stub(user.getStorageDriver(), "save")
            .callsFake(() => true)
            .onCall(4)
            .callsFake(({ model }) => {
                model.id = usersGroups.sixth;
                return true;
            })
            .onCall(5)
            .callsFake(({ model }) => {
                model.id = J;
                return true;
            })
            .onCall(6)
            .callsFake(({ model }) => {
                model.id = usersGroups.seventh;
                return true;
            })
            .onCall(8)
            .callsFake(({ model }) => {
                model.id = usersGroups.eighth;
                return true;
            });

        await user.save();
        modelSave.restore();

        expect(modelSave.callCount).toEqual(9);

        expect(user.getField("groups").initial).toHaveLength(5);
        expect(user.getField("groups").initial[0].id).toEqual(P);
        expect(user.getField("groups").initial[1].id).toEqual(Q);
        expect(user.getField("groups").initial[2].id).toEqual(I);
        expect(user.getField("groups").initial[3].id).toEqual(J);
        expect(user.getField("groups").initial[4].id).toEqual(I);
        expect(user.getField("groups").current).toHaveLength(5);
        expect(user.getField("groups").current[0].id).toEqual(P);
        expect(user.getField("groups").current[1].id).toEqual(Q);
        expect(user.getField("groups").current[2].id).toEqual(I);
        expect(user.getField("groups").current[3].id).toEqual(J);
        expect(user.getField("groups").current[4].id).toEqual(I);

        expect(user.getField("groups").links.initial).toHaveLength(5);
        expect(user.getField("groups").links.initial[0].id).toEqual(usersGroups.fourth);
        expect(user.getField("groups").links.initial[1].id).toEqual(usersGroups.fifth);
        expect(user.getField("groups").links.initial[2].id).toEqual(usersGroups.sixth);
        expect(user.getField("groups").links.initial[3].id).toEqual(usersGroups.seventh);
        expect(user.getField("groups").links.initial[4].id).toEqual(usersGroups.eighth);

        expect(user.getField("groups").links.current).toHaveLength(5);
        expect(user.getField("groups").links.current[0].id).toEqual(usersGroups.fourth);
        expect(user.getField("groups").links.current[1].id).toEqual(usersGroups.fifth);
        expect(user.getField("groups").links.current[2].id).toEqual(usersGroups.sixth);
        expect(user.getField("groups").links.current[3].id).toEqual(usersGroups.seventh);
        expect(user.getField("groups").links.current[4].id).toEqual(usersGroups.eighth);

        // Let's try to remove values using shift / pop - deletes should occur.
        groups.pop();
        groups.shift();

        user.groups = groups;

        const modelDelete = sandbox.spy(user.getStorageDriver(), "delete");
        modelSave = sandbox.stub(user.getStorageDriver(), "save");
        await user.save();

        expect(modelSave.callCount).toEqual(4);
        expect(modelDelete.callCount).toEqual(2);

        modelSave.restore();
        modelDelete.restore();

        expect(user.getField("groups").initial).toHaveLength(3);
        expect(user.getField("groups").initial[0].id).toEqual(Q);
        expect(user.getField("groups").initial[1].id).toEqual(I);
        expect(user.getField("groups").initial[2].id).toEqual(J);
        expect(user.getField("groups").current).toHaveLength(3);
        expect(user.getField("groups").current[0].id).toEqual(Q);
        expect(user.getField("groups").current[1].id).toEqual(I);
        expect(user.getField("groups").current[2].id).toEqual(J);

        expect(user.getField("groups").links.initial).toHaveLength(3);
        expect(user.getField("groups").links.initial[0].id).toEqual(usersGroups.fifth);
        expect(user.getField("groups").links.initial[1].id).toEqual(usersGroups.sixth);
        expect(user.getField("groups").links.initial[2].id).toEqual(usersGroups.seventh);

        expect(user.getField("groups").links.current).toHaveLength(3);
        expect(user.getField("groups").links.current[0].id).toEqual(usersGroups.fifth);
        expect(user.getField("groups").links.current[1].id).toEqual(usersGroups.sixth);
        expect(user.getField("groups").links.current[2].id).toEqual(usersGroups.seventh);
    });

    test("must not recreate links", async () => {
        const A = mdbid();
        const X = mdbid();
        const Y = mdbid();
        const Z = mdbid();
        const newOne = mdbid();

        let modelFindById = sandbox
            .stub(User.getStorageDriver(), "findOne")
            .callsFake(() => ({ id: A }));

        const user = await User.findById(A);
        modelFindById.restore();

        // Let's try to populate with the same data as in DB.
        user.populate({
            groups: [
                { id: X, name: "Group X" },
                { id: Y, name: "Group Y" },
                { id: Z, name: "Group Z" },
                { id: newOne, name: "Group NewOne" }
            ]
        });

        expect(user.getField("groups").state.dirty).toBe(true);

        let modelSaveSpy = sandbox.spy(User.getStorageDriver(), "save");
        let modelDeleteSpy = sandbox.spy(User.getStorageDriver(), "delete");

        sandbox
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
            })
            .onCall(3)
            .callsFake(() => {
                return { id: newOne, name: "Group NewOne" };
            });

        const usersGroups1st = mdbid();
        const usersGroups2nd = mdbid();
        const usersGroups3rd = mdbid();

        sandbox.stub(UsersGroups.getStorageDriver(), "find").callsFake(() => {
            return [
                [
                    { id: usersGroups1st, user: A, group: X },
                    { id: usersGroups2nd, user: A, group: Y },
                    { id: usersGroups3rd, user: A, group: Z }
                ]
            ];
        });

        await user.save();

        expect(modelSaveSpy.callCount).toEqual(2);
        expect(modelDeleteSpy.callCount).toEqual(0);
    });

    test("should not save/delete dynamic attributes", async () => {
        const A  = mdbid();

        let modelFindById = sandbox
            .stub(UserDynamic.getStorageDriver(), "findOne")
            .callsFake(() => ({ id: A }));

        const user = await UserDynamic.findById(A);
        modelFindById.restore();

        let modelSave = sandbox
            .stub(user.getStorageDriver(), "save")
            .onCall(0)
            .callsFake(() => {
                return true;
            })
            .onCall(1)
            .callsFake(() => {
                return true;
            });
        await user.save();
        expect(modelSave.callCount).toEqual(0);

        user.name = "now it should save because of this dirty attribute";
        await user.save();
        modelSave.restore();
        expect(modelSave.callCount).toEqual(1);

        let modelDelete = sandbox
            .stub(user.getStorageDriver(), "delete")
            .onCall(0)
            .callsFake(() => {
                return true;
            })
            .onCall(1)
            .callsFake(() => {
                return true;
            });

        await user.delete();
        modelDelete.restore();
        expect(modelDelete.callCount).toEqual(1);
    });
});
