import { Two } from "../../resources/models/oneTwoThree";
import { withFields, string, fields } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import createModel from "../../resources/models/createModel";

describe("nested ref field test", () => {
    beforeEach(() => Two.getStoragePool().flush());

    test("if ref is not a direct child of withStorage model, it should still know when to save itself", async () => {
        // In this case we need to provide parent that has withStorage applied. This is how it is for now,
        // we can try to think of a smarter solution in the future.
        const SomeRef = compose(
            withName("SomeRef"),
            withFields({
                someRefName: string()
            })
        )(createModel());

        const InvalidSomeClass = compose(
            withFields(instance => ({
                name: string(),
                nested1: fields({
                    value: {},
                    instanceOf: withFields({
                        nested1Field1: string(),
                        nested1Field2: string(),
                        nested1Ref: ref({ parent: instance, instanceOf: SomeRef }),
                        nested2: fields({
                            value: {},
                            instanceOf: withFields({
                                nested2Field1: string(),
                                nested2Field2: string(),
                                nested2Ref: ref({
                                    // parent: instance, Missing parent!
                                    value: {},
                                    instanceOf: SomeRef
                                })
                            })()
                        })
                    })()
                })
            })),
            withName("SomeClass")
        )(createModel());

        try {
            new InvalidSomeClass();
        } catch (e) {
            expect(e.message).toBe(
                `"ref" field nested2Ref has a parent with no "withStorage" applied.`
            );
        }

        const SomeClass = compose(
            withFields(instance => ({
                name: string(),
                nested1: fields({
                    value: {},
                    instanceOf: withFields({
                        nested1Field1: string(),
                        nested1Field2: string(),
                        nested1Ref: ref({ parent: instance, instanceOf: SomeRef }),
                        nested2: fields({
                            value: {},
                            instanceOf: withFields({
                                nested2Field1: string(),
                                nested2Field2: string(),
                                nested2Ref: ref({
                                    parent: instance,
                                    value: {},
                                    instanceOf: SomeRef
                                })
                            })()
                        })
                    })()
                })
            })),
            withName("SomeClass")
        )(createModel());

        new SomeClass();
    });
});
