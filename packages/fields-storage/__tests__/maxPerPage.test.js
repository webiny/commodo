import { withFields, string } from "@commodo/fields";
import { withStorage } from "@commodo/fields-storage";
import { withName } from "@commodo/name";
import { compose } from "ramda";
import { CustomDriver } from "./resources/CustomDriver";

const EntityWithoutMaxLimit = compose(
    withFields({
        name: string()
    }),
    withName("EntityWithoutMaxLimit"),
    withStorage({
        driver: new CustomDriver()
    })
)();

const EntityWithMaxLimit = compose(
    withFields({
        name: string()
    }),
    withName("EntityWithMaxLimit"),
    withStorage({
        driver: new CustomDriver(),
        maxLimit: 500
    })
)();

const EntityWithMaxLimitSetToNull = compose(
    withFields({
        name: string()
    }),
    withName("EntityWithMaxLimit"),
    withStorage({
        driver: new CustomDriver(),
        maxLimit: null
    })
)();

describe("maxLimit test", () => {
    test("must throw errors if maxLimit config parameter was exceeded", async () => {
        await EntityWithoutMaxLimit.find({ limit: 99 });
        await EntityWithoutMaxLimit.find({ limit: 100 });

        let error = null;
        try {
            await EntityWithoutMaxLimit.find({ limit: 101 });
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe("Cannot query for more than 100 models per page.");

        await EntityWithMaxLimit.find({ limit: 499 });
        await EntityWithMaxLimit.find({ limit: 500 });

        error = null;
        try {
            await EntityWithMaxLimit.find({ limit: 501 });
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe("Cannot query for more than 500 models per page.");

        await EntityWithMaxLimitSetToNull.find({ limit: 100 });

        error = null;
        try {
            await EntityWithoutMaxLimit.find({ limit: 101 });
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe("Cannot query for more than 100 models per page.");
    });
});
