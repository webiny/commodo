import User from "./resources/models/User";

describe("set test", () => {
    test("should set values correctly", async () => {
        const user = new User();

        expect(user.getField("firstName").isSet()).toBe(false);
        expect(user.getField("lastName").isSet()).toBe(false);
        expect(user.getField("age").isSet()).toBe(false);
        expect(user.getField("enabled").isSet()).toBe(false);
        
        user.firstName = "John";
        user.lastName = "Doe";
        user.age = 12;
        user.enabled = true;

        expect(user.firstName).toBe("John");
        expect(user.lastName).toBe("Doe");
        expect(user.age).toBe(12);
        expect(user.enabled).toBe(true);

        expect(user.getField("firstName").isSet()).toBe(true);
        expect(user.getField("lastName").isSet()).toBe(true);
        expect(user.getField("age").isSet()).toBe(true);
        expect(user.getField("enabled").isSet()).toBe(true);
    });
});
