import { MainEntity, Entity1 } from "../../resources/models/modelsAttributeModels";
import { Collection } from "@commodo/fields-storage";

import { withFields, onSet } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";

describe("onSet test", () => {
    beforeEach(() => MainEntity.getStoragePool().flush());

    test("should return value set inside onSet callback", async () => {
        const forcedEntityCollection = new Collection([
            new Entity1(),
            new Entity1(),
            new Entity1()
        ]);

        const MainEntityEdited = compose(
            withName("MainEntityEdited"),
            withFields({
                onSetTests: onSet(() => {
                    return forcedEntityCollection;
                })(ref({ list: true, instanceOf: Entity1 }))
            })
        )(MainEntity);

        const model = new MainEntityEdited();

        model.onSetTests = [];

        expect(await model.onSetTests).toEqual(forcedEntityCollection);
    });
});
