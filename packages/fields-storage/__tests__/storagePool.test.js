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
        sandbox.stub(user.getStorageDriver(), "create").callsFake(args => {
            return [true, {}];
        });

        expect(User.getStoragePool().get(user)).toEqual(undefined);
        await user.save();
        expect(User.getStoragePool().get(user)).toBeInstanceOf(User);

        sandbox.stub(user.getStorageDriver(), "delete").callsFake(() => [true, {}]);
        await user.delete();

        expect(User.getStoragePool().get(user)).toEqual(undefined);
    });

    test("get methods should return correctly (whether is called with a model class or an instance)", async () => {
        const A = mdbid();

        const user = new User();
        user.age = 30;
        user.id = A;

        expect(User.getStoragePool().get(user)).toEqual(undefined);
        expect(User.getStoragePool().get(User, { id: A })).toEqual(undefined);

        await user.save();
        expect(User.getStoragePool().get(user)).not.toEqual(undefined);
        expect(User.getStoragePool().get(User, { id: A })).not.toEqual(undefined);
    });

    test("findOne must add to the pool and consequent findById calls must utilize it", async () => {
        const A = mdbid();
        const modelFind = sandbox.stub(User.getStorageDriver(), "find").callsFake(() => {
            return [[{ id: A }], {}];
        });

        expect(User.getStoragePool().get(User, { id: A })).toEqual(undefined);

        const user1 = await User.findOne({ query: { id: A } });
        expect(User.getStoragePool().get(User, { id: A })).not.toEqual(undefined);

        expect(modelFind.callCount).toEqual(1);

        const user2 = await User.findOne({ query: { id: A } });
        expect(modelFind.callCount).toEqual(1);

        expect(user1).toEqual(user2);
    });

    test("find must add to the pool and consequent finds must utilize it", async () => {
        const A = mdbid();
        const B = mdbid();
        const C = mdbid();

        const modelFind = sandbox.stub(User.getStorageDriver(), "find").callsFake(() => {
            return [[{ id: A }, { id: B }, { id: C }]];
        });

        expect(User.getStoragePool().get(User, { id: A })).toEqual(undefined);
        expect(User.getStoragePool().get(User, { id: B })).toEqual(undefined);
        expect(User.getStoragePool().get(User, { id: C })).toEqual(undefined);
        const users1 = await User.find({});
        expect(User.getStoragePool().get(User, { id: A })).not.toEqual(undefined);
        expect(User.getStoragePool().get(User, { id: B })).not.toEqual(undefined);
        expect(User.getStoragePool().get(User, { id: C })).not.toEqual(undefined);

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
        const A = mdbid(),
            B = mdbid(),
            C = mdbid();

        sandbox
            .stub(User.getStorageDriver(), "find")
            .onCall(0)
            .callsFake(() => {
                return [[{ id: A }], {}];
            })
            .onCall(1)
            .callsFake(() => {
                return [[{ id: B }], {}];
            })
            .onCall(2)
            .callsFake(() => {
                return [[{ id: C }], {}];
            });

        await User.findOne({ query: { id: A } });
        await User.findOne({ query: { id: B } });
        await User.findOne({ query: { id: C } });
        expect(User.getStoragePool().get(User, { id: A })).not.toEqual(undefined);
        expect(User.getStoragePool().get(User, { id: B })).not.toEqual(undefined);
        expect(User.getStoragePool().get(User, { id: C })).not.toEqual(undefined);

        User.getStoragePool().flush();
        expect(User.getStoragePool().pool).toBeEmpty;
    });

    test("findOne must return from pool if possible", async () => {
        const A = mdbid();
        const modelFindOne = sandbox.stub(User.getStorageDriver(), "find").callsFake(() => {
            return [[{ id: A }], {}];
        });

        expect(User.getStoragePool().get(User, { id: A })).toEqual(undefined);
        const foundUser = await User.findOne({});
        expect(User.getStoragePool().get(User, { id: A })).not.toEqual(undefined);
        expect(modelFindOne.callCount).toEqual(1);

        const againFoundUser = await User.findOne({});
        expect(modelFindOne.callCount).toEqual(2);
        expect(foundUser).toEqual(againFoundUser);
    });
});
