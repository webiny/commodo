import { withFields, setOnce, string } from "@commodo/fields";
import { withName } from "@commodo/name";
import createModel from "./resources/models/createModel";
import sinon from "sinon";
import mdbid from "mdbid";
import { compose } from "ramda";
const sandbox = sinon.createSandbox();

describe("setOnce test", () => {
    test("fields defined with setOnce should not change.", async () => {
        const id = mdbid();
        const SomeModel = compose(
            withName("SomeModel"),
            withFields({
                slug: setOnce()(string()),
                name: string()
            })
        )(createModel());

        let modelFindById = sandbox
            .stub(SomeModel.getStorageDriver(), "findOne")
            .callsFake(() => ({
                id,
                slug: "slug-test",
                name: "name-test"
            }));

        const someModel1 = await SomeModel.findById(id);

        expect(someModel1.getField("slug").current).toBe("slug-test");
        expect(someModel1.getField("slug").state.set).toBe(true);

        expect(someModel1.getField("name").current).toBe("name-test");
        expect(someModel1.getField("name").state.set).toBe(true);

        // Changing the slug and saving it to the database should not work
        // Slug should not change because of a "setOnce" call.
        let saveSpy = sandbox.spy(someModel1.getStorageDriver(), "save");

        someModel1.slug = "slug-test-2";
        await someModel1.save();

        expect(saveSpy.callCount).toEqual(0);

        someModel1.name = "name-test-2";
        await someModel1.save();

        expect(saveSpy.callCount).toEqual(1);
        expect(saveSpy.getCall(0).args[0]).toEqual({
            data: {
                id: id,
                name: "name-test-2"
            },
            isCreate: false,
            isUpdate: true,
            name: "SomeModel"
        });
    });
});
