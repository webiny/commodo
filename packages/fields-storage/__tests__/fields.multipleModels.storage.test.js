import sinon from "sinon";
import { withFields, string, fields } from "@commodo/fields";
import { withName } from "@commodo/name";
import { compose } from "ramda";
import createModel from "./resources/models/createModel";

const sandbox = sinon.createSandbox();

describe("fields field - multiple models with instanceOf as array", function() {
    afterEach(() => sandbox.restore());

    const ModelA = compose(
        withFields({ modelAField1: string(), __type: string() }),
        withName("ModelA")
    )();

    const ModelB = compose(
        withFields({ modelBField1: string(), __type: string() }),
        withName("ModelB")
    )();

    it("data received from storage should be handled correctly - correct model instances should be created", async () => {
        const Model = compose(
            withName("Model"),
            withFields({
                name: string(),
                someModels: fields({ instanceOf: [ModelA, ModelB, "__type"] })
            })
        )(createModel());

        let findOneStub = sandbox.stub(Model.getStorageDriver(), "read").callsFake(() => {
            return [
                [
                    {
                        name: "abc",
                        someModels: {
                            modelAField1: "modelAField1-value",
                            __type: "ModelA"
                        }
                    }
                ],
                {}
            ];
        });

        let model = await Model.findOne();
        expect(model.someModels).toBeInstanceOf(ModelA);
        expect(model.someModels.__type).toBe("ModelA");
        expect(model.someModels.modelAField1).toBe("modelAField1-value");
        findOneStub.restore();

        findOneStub = sandbox.stub(Model.getStorageDriver(), "read").callsFake(() => {
            return [
                [
                    {
                        name: "bcd",
                        someModels: {
                            modelBField1: "modelBField1-value",
                            __type: "ModelB"
                        }
                    }
                ],
                {}
            ];
        });

        model = await Model.findOne();
        expect(model.someModels).toBeInstanceOf(ModelB);
        expect(model.someModels.__type).toBe("ModelB");
        expect(model.someModels.modelBField1).toBe("modelBField1-value");
        findOneStub.restore();
    });

    it("list field - data received from storage should be handled correctly - correct model instances should be created", async () => {
        const Model = compose(
            withName("Model"),
            withFields({
                name: string(),
                someModels: fields({ list: true, instanceOf: [ModelA, ModelB, "__type"] })
            })
        )(createModel());

        let findOneStub = sandbox.stub(Model.getStorageDriver(), "read").callsFake(() => {
            return [
                [
                    {
                        name: "abc",
                        someModels: [
                            {
                                modelAField1: "modelAField1-value",
                                __type: "ModelA"
                            },
                            {
                                modelBField1: "modelBField1-value",
                                __type: "ModelB"
                            }
                        ]
                    }
                ],
                {}
            ];
        });

        let model = await Model.findOne();
        expect(model.someModels[0].__type).toBe("ModelA");
        expect(model.someModels[0].modelAField1).toBe("modelAField1-value");

        expect(model.someModels[1].__type).toBe("ModelB");
        expect(model.someModels[1].modelBField1).toBe("modelBField1-value");

        findOneStub.restore();
    });
});
