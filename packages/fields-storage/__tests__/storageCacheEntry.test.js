import User from "./resources/models/User";
import { StorageCacheEntry } from "@commodo/fields-storage";

describe("model pool entry test", () => {
    test("setModel/getModel methods must work correctly", async () => {
        const modelPoolEntry = new StorageCacheEntry();
        expect(modelPoolEntry.getModel()).toBeUndefined;
        modelPoolEntry.setModel(new User());
        expect(modelPoolEntry.getModel()).toBeInstanceOf(User);
    });

    test("setModel/getModel methods must work correctly", async () => {
        const modelPoolEntry = new StorageCacheEntry();
        expect(modelPoolEntry.getMeta().createdOn).toBeInstanceOf(Date);
        modelPoolEntry.setMeta(null);
        expect(modelPoolEntry.getMeta()).toBe(null);
    });
});
