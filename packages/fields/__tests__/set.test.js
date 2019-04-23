import User from "./resources/models/User";

describe("set test", () => {
    test("should set values correctly", async () => {
        const user = new User();

        user.firstName = "John";
        user.lastName = "Doe";
        user.age = 12;
        user.enabled = true;

        expect(user.firstName).toBe("John");
        expect(user.lastName).toBe("Doe");
        expect(user.age).toBe(12);
        expect(user.enabled).toBe(true);
    });
});
