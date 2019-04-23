import User from "./resources/models/User";

describe("field name test", () => {
    test("should return correct field name", async () => {
        const user = new User();
        expect(user.getField("firstName").name).toBe("firstName");
        expect(user.getField("lastName").name).toBe("lastName");
        expect(user.getField("enabled").name).toBe("enabled");
        expect(user.getField("age").name).toBe("age");
    });
});
