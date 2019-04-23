import { MainEntity, Entity1 } from "../../resources/models/modelsAttributeModels";
import { withFields, onSet } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";

import { compose } from "ramda";
describe("attribute models test", () => {
    test("should set empty EntityCollection - attributes should accept array of models", async () => {
        const MainEntityEdit = compose(
            withName("MainEntityEdit"),
            withFields({
                autoSaveDelete: ref({
                    instanceOf: Entity1,
                    list: true,
                    autoDelete: true,
                    autoSave: true
                }),
                autoSaveDeleteImmediate: ref({
                    instanceOf: Entity1,
                    list: true,
                    autoDelete: false,
                    autoSave: false
                })
            })
        )(MainEntity);

        const model = new MainEntityEdit();
        let attribute = model.getField("autoSaveDelete");

        expect(attribute.getAutoDelete()).toEqual(true);
        expect(attribute.getAutoSave()).toEqual(true);

        attribute.setAutoDelete(true).setAutoSave(true);
        expect(attribute.getAutoDelete()).toEqual(true);
        expect(attribute.getAutoSave()).toEqual(true);

        attribute.setAutoDelete(false).setAutoSave(false);
        expect(attribute.getAutoDelete()).toEqual(false);
        expect(attribute.getAutoSave()).toEqual(false);

        attribute = model.getField("autoSaveDeleteImmediate");

        expect(attribute.getAutoDelete()).toEqual(false);
        expect(attribute.getAutoSave()).toEqual(false);
    });
});
