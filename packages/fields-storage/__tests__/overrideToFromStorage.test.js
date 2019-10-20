import sinon from "sinon";
import createModel from "./resources/models/createModel";
import { withFields, string } from "@commodo/fields";
import { compose } from "ramda";
import mdbid from "mdbid";

const sandbox = sinon.createSandbox();
describe("override toStorage / fromStorage field methods test", function() {
    afterEach(() => sandbox.restore());

    it("set toStorage / fromStorage on custom field", async () => {
        const testValues = {};
        const customField = rest => {
            return string({
                ...rest,
                async getStorageValue(value) {
                    testValues.getStorageValue = true;
                    return value;
                },
                setStorageValue() {
                    testValues.setStorageValue = true;
                    return this;
                }
            });
        };

        const Model = compose(
            withFields({
                customField: customField()
            })
        )(createModel());

        const model1 = new Model();
        model1.customField = "test";
        await model1.save();

        expect(testValues).toEqual({
            getStorageValue: true
        });

        const id = mdbid();

        const findOneStub = sandbox.stub(Model.getStorageDriver(), "findOne").callsFake(() => {
            return {
                id,
                customField: mdbid()
            };
        });

        await Model.findOne({ query: { id } });
        findOneStub.restore();

        expect(testValues).toEqual({
            getStorageValue: true,
            setStorageValue: true
        });
    });
});
