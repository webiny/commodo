import User from "./resources/models/User";

describe("getFields test", () => {
    test("should return all fields", async () => {
        const user = new User();

        const allFields = user.getFields();

        expect(Object.keys(allFields)).toEqual([
            "firstName",
            "lastName",
            "age",
            "enabled",
            "totalSomething"
        ]);

        expect(allFields["firstName"].type).toBe("string");
        expect(allFields["lastName"].type).toBe("string");
        expect(allFields["enabled"].type).toBe("boolean");
        expect(allFields["age"].type).toBe("number");
        expect(allFields["totalSomething"].type).toBe("number");
    });
});
