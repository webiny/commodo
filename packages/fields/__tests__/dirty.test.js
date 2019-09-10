import { compose } from "ramda";
import { withFields, string, number } from "@commodo/fields";

describe("dirty and clean test", () => {
    test("should make attributes dirty", async () => {
        const Model = compose(
            withFields({
                firstName: string(),
                lastName: string(),
                number: number()
            })
        )();

        const model = new Model();

        expect(model.isDirty()).toBe(false);

        model.lastName = "Test1";

        expect(model.getField("firstName").isDirty()).toBe(false);
        expect(model.getField("lastName").isDirty()).toBe(true);
        expect(model.getField("number").isDirty()).toBe(false);

        expect(model.isDirty()).toBe(true);

        model.clean();
        expect(model.isDirty()).toBe(false);

        model.lastName = "Test1";
        expect(model.isDirty()).toBe(false);

        model.lastName = "Test2";
        expect(model.isDirty()).toBe(true);
    });
});
