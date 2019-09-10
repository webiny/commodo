import { MainEntity } from "../../../resources/models/modelsAttributeModels";
import sinon from "sinon";
const sandbox = sinon.createSandbox();
import mdbid from "mdbid";

describe("attribute models test", () => {
    afterEach(() => sandbox.restore());
    beforeEach(() => MainEntity.getStoragePool().flush());

    test("should use correct storage query to fetch linked models", async () => {
        let modelFindById = sandbox
            .stub(MainEntity.getStorageDriver(), "findOne")
            .callsFake(() => ({ id: "A" }));

        const oneTwoThree = mdbid();
        const mainEntity = await MainEntity.findById(oneTwoThree);
        modelFindById.restore();

        const findSpy = sandbox.spy(MainEntity.getStorageDriver(), "find");
        await mainEntity.attribute1;

        expect(findSpy.getCall(0).args[0].options).toEqual({
            page: 1,
            perPage: 10,
            query: {
                mainEntity: "A"
            }
        });

        findSpy.restore();
    });
});
