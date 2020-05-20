import User from "./resources/models/User";
import mdbid from "mdbid";
describe("driver override test", () => {
    test("should validate given ID correctly (static call)", async () => {
        expect(User.isId(123)).toBe(false);
        expect(User.isId(mdbid())).toBe(true);
    });

    test("should validate given ID correctly (instance call)", async () => {
        const user = new User();
        expect(user.isId(123)).toBe(false);
        expect(user.isId(mdbid())).toBe(true);
    });
});
