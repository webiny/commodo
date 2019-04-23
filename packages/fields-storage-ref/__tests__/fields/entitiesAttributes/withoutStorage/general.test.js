import { MainEntity } from "../../../resources/models/modelsAttributeModels";

describe("attribute models test", () => {
    beforeEach(() => MainEntity.getStoragePool().flush());

    test("should not set anything as values since setToStorage is not enabled by default", async () => {
        const mainEntity = new MainEntity();

        mainEntity.populateFromStorage({
            attribute1: ["A", "B"],
            attribute2: ["C"]
        });

        expect(Array.isArray(mainEntity.getField("attribute1").current)).toBe(true);
        expect(Array.isArray(mainEntity.getField("attribute2").current)).toBe(true);
    });
});
