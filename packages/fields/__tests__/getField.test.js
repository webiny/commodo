import User from "./resources/models/User";

describe("getField test", () => {
    test("should return field", async () => {
        const user = new User();
        expect(user.getField("firstName").type).toBe('string');
        expect(user.getField("lastName").type).toBe('string');
        expect(user.getField("enabled").type).toBe('boolean');
        expect(user.getField("age").type).toBe('number');
    });

    test("should return undefined because fields do not exist", async () => {
        const user = new User();
        expect(user.getField("firstName____")).not.toBeDefined();
        expect(user.getField("lastName____")).not.toBeDefined();
        expect(user.getField("enabled____")).not.toBeDefined();
        expect(user.getField("age___")).not.toBeDefined();
    });
});
