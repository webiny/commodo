import { Two } from "../../resources/models/oneTwoThree";
import { withFields, string, onSet } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import createModel from "../../resources/models/createModel";

describe("onSet test", () => {
    beforeEach(() => Two.getStoragePool().flush());

    test("should return value set inside onSet callback", async () => {
        const forcedTwo = new Two();
        forcedTwo.id = "forced";

        const One = compose(
            withName("One"),
            withFields({
                name: string(),
                two: onSet(() => forcedTwo)(ref({ instanceOf: Two, autoDelete: true }))
            })
        )(createModel());

        const one = new One();
        one.two = new Two();

        expect((await one.two).id).toEqual("forced");
    });
});
