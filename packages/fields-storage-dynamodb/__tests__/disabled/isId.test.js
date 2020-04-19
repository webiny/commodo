import useModels from "./utils/useModels";

describe("isId test", () => {
    const { models } = useModels();

    it("should validate given ID correctly (static call)", async () => {
        expect(models.SimpleModel.isId(123)).toBe(false);
        expect(models.SimpleModel.isId("01234567890123456789adee")).toBe(true);
    });

    it("should validate given ID correctly (instance call)", async () => {
        const user1 = new models.SimpleModel();
        expect(user1.isId(123)).toBe(false);
        expect(user1.isId("01234567890123456789adee")).toBe(true);
    });
});
