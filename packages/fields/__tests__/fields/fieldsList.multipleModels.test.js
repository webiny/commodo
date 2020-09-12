import { compose } from "ramda";
import { withFields, fields, string } from "@commodo/fields";
import { withName } from "@commodo/name";

describe("fields field should allow setting multiple models via  the instanceOf arg", () => {
    // Some test models for the tests below.
    const ModelA = compose(
        withFields({ modelAField1: string(), __type: string() }),
        withName("ModelA")
    )();
    const ModelB = compose(
        withFields({ modelBField1: string(), __type: string() }),
        withName("ModelB")
    )();
    const Model = compose(
        withFields({
            someModels: fields({ list: true, instanceOf: [ModelA, ModelB, "__type"] })
        })
    )();

    test("should be able to receive different model instances", async () => {
        const testModel = new Model();
        testModel.someModels = [
            new ModelA().populate({ modelAField1: "A" }),
            new ModelB().populate({ modelBField1: "B" })
        ];

        expect(testModel.someModels[0]).toBeInstanceOf(ModelA);
        expect(testModel.someModels[1]).toBeInstanceOf(ModelB);

        expect(testModel.someModels[0].modelAField1).toBe('A')
        expect(testModel.someModels[1].modelBField1).toBe("B");

        expect(testModel.someModels[0].__type).toBe('ModelA')
        expect(testModel.someModels[1].__type).toBe("ModelB");
    });

    test(`should be able to receive plain objects with "__type" property set`, async () => {
        const testModel = new Model();
        testModel.someModels = [
            { modelAField1: "A", __type: "ModelA" },
            { modelBField1: "B", __type: "ModelB" }
        ];

        expect(testModel.someModels[0]).toBeInstanceOf(ModelA);
        expect(testModel.someModels[1]).toBeInstanceOf(ModelB);

        expect(testModel.someModels[0].modelAField1).toBe('A')
        expect(testModel.someModels[1].modelBField1).toBe('B')

        expect(testModel.someModels[0].__type).toBe('ModelA')
        expect(testModel.someModels[1].__type).toBe("ModelB");
    });
});
