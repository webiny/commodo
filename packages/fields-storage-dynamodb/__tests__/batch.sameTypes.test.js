import { useModels } from "./models";
import { Batch } from "@commodo/fields-storage";

describe("same batch type test", function() {
    const { models, id: pk } = useModels();

    it("should not be able to continue with different batch operation types", async () => {
        const { SimpleModel } = models;

        const a = new SimpleModel().populate({ pk, sk: "something-0" });

        const batch = new Batch([a, "save"], [SimpleModel, "find"]);

        let error;
        try {
            await batch.execute();
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe(
            `Cannot batch operations - all operations must be of the same type (the initial operation type was "GetRequest", and operation type on index "1" is "PutRequest").`
        );
    });
});
