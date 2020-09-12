import { compose } from "ramda";
import { withFields, fields, string } from "@commodo/fields";
import { withName } from "@commodo/name";

describe("fields field should allow setting multiple models via  the instanceOf arg", () => {
    // Some test models for the tests below.
    const ModelA = compose(
        withFields({ ModelAField1: string(), __type: string() }),
        withName("ModelA")
    )();
    const ModelB = compose(
        withFields({ ModelBField1: string(), __type: string() }),
        withName("ModelB")
    )();
    const InvalidModel = compose(withFields(), withName("InvalidModel"))();
    const NamelessModel = compose(withFields(), withName("NamelessModel"))();
    const Model = compose(
        withFields({
            someModels: fields({ instanceOf: [ModelA, ModelB, "__type"] })
        })
    )();

    test("should be able to receive different model instances", async () => {
        const testModel = new Model();
        testModel.someModels = new ModelA().populate({ ModelAField1: "A" });

        expect(testModel.someModels.ModelAField1).toBe("A");
        expect(testModel.someModels.__type).toBe("ModelA");
        expect(testModel.someModels).toBeInstanceOf(ModelA);

        testModel.someModels = new ModelB().populate({ ModelBField1: "B" });

        expect(testModel.someModels.ModelBField1).toBe("B");
        expect(testModel.someModels.__type).toBe("ModelB");
        expect(testModel.someModels).toBeInstanceOf(ModelB);

        testModel.someModels = null;
        expect(testModel.someModels).toBe(null);
    });

    test(`should be able to receive plain objects with "__type" property set`, async () => {
        const testModel = new Model();
        testModel.someModels = { ModelAField1: "A", __type: "ModelA" };

        expect(testModel.someModels.ModelAField1).toBe("A");
        expect(testModel.someModels.__type).toBe("ModelA");
        expect(testModel.someModels).toBeInstanceOf(ModelA);

        testModel.someModels = { ModelBField1: "B", __type: "ModelB" };

        expect(testModel.someModels.ModelBField1).toBe("B");
        expect(testModel.someModels.__type).toBe("ModelB");
        expect(testModel.someModels).toBeInstanceOf(ModelB);

        testModel.someModels = null;
        expect(testModel.someModels).toBe(null);
    });

    test(`must throw an error if received plain object does not contain "__type" property and value`, async () => {
        const testModel = new Model();
        let error = null;
        try {
            testModel.someModels = { ModelAField1: "A" };
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe(
            'Cannot set value to a "fields" field - the "__type" property of the received plain object is missing.'
        );
    });

    test(`must throw an error if received plain object contains an invalid "__type" value`, async () => {
        const testModel = new Model();
        let error = null;
        try {
            testModel.someModels = { ModelAField1: "A", __type: "XYZ" };
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe(
            `Cannot set value to a "fields" field - the "__type" property of the received plain object contains an invalid value XYZ.`
        );
    });

    test("must throw an error because an invalid class was passed", async () => {
        const testModel = new Model();

        let error;
        try {
            testModel.someModels = new InvalidModel();
        } catch (e) {
            error = e;
        }

        expect(error.message).toBeTruthy();

        error = null;
        try {
            testModel.someModels = new NamelessModel();
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe(
            'Invalid data type: fields field "someModels" cannot accept value [object Object].'
        );
    });

    test(`must throw an error since string wasn't passed as the last argument to "instanceOf"`, async () => {
        let error;
        try {
            compose(
                withFields({
                    someModels: fields({ instanceOf: [ModelA, ModelB] })
                })
            )();
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe(
            `Invalid "fields" field - when passing "instanceOf" as an array, the last item must be a string, marking the field name that will contain the model type.`
        );
    });

    test("must throw an error since instanceOf type field is missing on the model instance we're trying to assign the data to", async () => {
        let error;
        try {
            const Model = compose(
                withFields({
                    someModels: fields({ instanceOf: [InvalidModel, "__type"] })
                })
            )();

            const testModel = new Model();
            testModel.someModels = new InvalidModel();
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe(
            `Cannot set value to a "fields" field - the "InvalidModel" should contain the "__type" string field, but it does not.`
        );
    });
});
