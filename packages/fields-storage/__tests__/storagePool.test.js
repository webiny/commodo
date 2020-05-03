import User from "./resources/models/User";
import sinon from "sinon";
import mdbid from "mdbid";

const sandbox = sinon.createSandbox();

describe("model pool test", () => {
    beforeEach(() => User.getStoragePool().flush());
    afterEach(() => sandbox.restore());

    test("after save, model should be present in the pool and after delete it must be removed", async () => {
        const A = mdbid();
        const user = new User();
        user.age = 30;
        sandbox.stub(user.getStorageDriver(), "save").callsFake(({ data }) => {
            data.id = A;
            return true;
        });

        expect(User.getStoragePool().has(user)).toEqual(false);
        expect(User.getStoragePool().get(user)).toEqual(undefined);
        await user.save();
        expect(User.getStoragePool().get(user)).toBeInstanceOf(User);
        expect(User.getStoragePool().has(user)).toEqual(true);

        sandbox.stub(user.getStorageDriver(), "delete").callsFake(() => true);
        await user.delete();

        expect(User.getStoragePool().has(user)).toEqual(false);
        expect(User.getStoragePool().get(user)).toEqual(undefined);
    });

    test("has and get methods should return true / false correctly (whether is called with a model class or an instance)", async () => {
        const A = mdbid();

        const user = new User();
        user.age = 30;
        user.id = A;

        expect(User.getStoragePool().has(user)).toEqual(false);
        expect(User.getStoragePool().has(User, A)).toEqual(false);
        await user.save();
        expect(User.getStoragePool().has(user)).toEqual(true);
        expect(User.getStoragePool().has(User, A)).toEqual(true);
    });

    test("findById must add to the pool and consequent findById calls must utilize it", async () => {
        const modelFindById = sandbox.stub(User.getStorageDriver(), "findOne").callsFake(() => {
            return { id: "A" };
        });

        expect(User.getStoragePool().has(User, "A")).toEqual(false);
        const user1 = await User.findById("A");
        expect(User.getStoragePool().has(User, "A")).toEqual(true);
        expect(modelFindById.callCount).toEqual(1);

        const user2 = await User.findById("A");
        expect(modelFindById.callCount).toEqual(1);

        expect(user1).toEqual(user2);
    });

    test("find must add to the pool and consequent finds must utilize it", async () => {
        const A = mdbid();
        const B = mdbid();
        const C = mdbid();

        const modelFind = sandbox.stub(User.getStorageDriver(), "find").callsFake(() => {
            return [[{ id: A }, { id: B }, { id: C }]];
        });

        expect(User.getStoragePool().has(User, A)).toEqual(false);
        expect(User.getStoragePool().has(User, B)).toEqual(false);
        expect(User.getStoragePool().has(User, C)).toEqual(false);
        const users1 = await User.find({});
        expect(User.getStoragePool().has(User, A)).toEqual(true);
        expect(User.getStoragePool().has(User, B)).toEqual(true);
        expect(User.getStoragePool().has(User, C)).toEqual(true);

        expect(modelFind.callCount).toEqual(1);
        const users2 = await User.find({});
        expect(modelFind.callCount).toEqual(2);

        expect(users1).toEqual(users2);
    });

    test("remove method must exist if class was not inserted before", async () => {
        expect(User.getStoragePool().pool).toBeEmpty;
        User.getStoragePool().remove(new User());
        expect(User.getStoragePool().pool).toBeEmpty;
    });

    test("flush method must empty the pool", async () => {
        sandbox
            .stub(User.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: "A" };
            })
            .onCall(1)
            .callsFake(() => {
                return { id: "B" };
            })
            .onCall(2)
            .callsFake(() => {
                return { id: "C" };
            });

        await User.findById("A");
        await User.findById("B");
        await User.findById("C");
        expect(User.getStoragePool().has(User, "A")).toEqual(true);
        expect(User.getStoragePool().has(User, "B")).toEqual(true);
        expect(User.getStoragePool().has(User, "C")).toEqual(true);

        User.getStoragePool().flush();
        expect(User.getStoragePool().pool).toBeEmpty;
    });

    test("findOne must return from pool if possible", async () => {
        const modelFindOne = sandbox.stub(User.getStorageDriver(), "findOne").callsFake(() => {
            return { id: "A" };
        });

        expect(User.getStoragePool().has(User, "A")).toEqual(false);
        const foundUser = await User.findOne({});
        expect(User.getStoragePool().has(User, "A")).toEqual(true);
        expect(modelFindOne.callCount).toEqual(1);

        const againFoundUser = await User.findOne({});
        expect(modelFindOne.callCount).toEqual(2);
        expect(foundUser).toEqual(againFoundUser);
    });
});
