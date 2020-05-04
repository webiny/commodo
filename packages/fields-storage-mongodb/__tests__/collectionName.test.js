import { getName } from "@commodo/name";
import useModels from "./models/useModels";

describe("collection name test", function() {
    const { models } = useModels();

    it("it should return model name as collection name", async () => {
        const { SimpleModel } = models;
        expect(SimpleModel.getStorageDriver().getCollectionName(getName(SimpleModel))).toEqual(
            "SimpleModel"
        );

        const model = new SimpleModel();
        expect(model.getStorageDriver().getCollectionName(getName(model))).toEqual("SimpleModel");
    });

    it("it should prepend prefix", async () => {
        const { SimpleModel } = models;
        SimpleModel.getStorageDriver().setCollectionPrefix("webiny_");
        const model = new SimpleModel();

        expect(SimpleModel.getStorageDriver().getCollectionName(getName(SimpleModel))).toBe(
            "webiny_SimpleModel"
        );
        expect(model.getStorageDriver().getCollectionName(getName(model))).toBe(
            "webiny_SimpleModel"
        );
    });

    it("it should apply collection name naming function", async () => {
        const { SimpleModel } = models;
        SimpleModel.getStorageDriver()
            .setCollectionPrefix("webiny_webiny_")
            .setCollectionNaming(({ name, driver }) => {
                return driver.getCollectionPrefix() + "_xyz_" + name;
            });

        const model = new SimpleModel();
        expect(typeof SimpleModel.getStorageDriver().getCollectionNaming()).toBe("function");
        expect(SimpleModel.getStorageDriver().getCollectionName(getName(SimpleModel))).toBe(
            "webiny_webiny__xyz_SimpleModel"
        );
        expect(model.getStorageDriver().getCollectionName(getName(model))).toBe(
            "webiny_webiny__xyz_SimpleModel"
        );
    });
});
