import { One, Two } from "../../resources/models/oneTwoThree";
import { withFields, string, onSet } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import createModel from "../../resources/models/createModel";
import sinon from "sinon";
import mdbid from "mdbid";

const sandbox = sinon.createSandbox();

describe("onSet test", () => {
    beforeEach(() => Two.getStoragePool().flush());

    test("should return value set inside onSet callback", async () => {
        const forcedTwo = new Two();
        forcedTwo.id = "forced";

        const One = compose(
            withFields({
                name: string(),
                two: onSet(() => forcedTwo)(ref({ instanceOf: Two, autoDelete: true }))
            }),
            withName("One")
        )(createModel());

        const one = new One();
        one.two = new Two();

        expect((await one.two).id).toEqual("forced");
    });

    test("onSet should not be triggered when loading from storage, no infinite loops should happen", async () => {
        let onSetCalledCount = 0;
        const One = compose(
            withFields({
                name: string(),
                two: onSet(nextValue => {
                    onSetCalledCount++;
                    return nextValue;
                })(ref({ instanceOf: Two }))
            }),
            withName("One")
        )(createModel());

        const ids = { one: mdbid(), two: mdbid(), anotherTwo: mdbid() };

        const findById = sandbox
            .stub(One.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: ids.one, name: "This is one.", two: ids.two };
            })
            .onCall(1)
            .callsFake(() => {
                return { id: ids.two, name: "This is two." };
            });

        // Should not throw.
        const one = await One.findById(ids.one);

        expect(one.getField("id").current).toBe(ids.one);
        expect(one.getField("two").current).toBe(ids.two);
        expect(one.getField("two").state.set).toBe(true);
        expect(onSetCalledCount).toBe(0);

        // Should not throw.
        await one.two;

        expect(one.getField("two").current.id).toBe(ids.two);
        expect(one.getField("two").state.set).toBe(true);
        expect(onSetCalledCount).toBe(0);

        one.two = ids.anotherTwo;
        expect(onSetCalledCount).toBe(1);
        findById.restore();
    });
});
