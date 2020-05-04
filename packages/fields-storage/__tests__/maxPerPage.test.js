import { withFields, string } from "@commodo/fields";
import { withStorage } from "@commodo/fields-storage";
import { withName } from "@commodo/name";
import { compose } from "ramda";
import { CustomDriver } from "./resources/CustomDriver";

const EntityWithoutMaxPerPage = compose(
    withFields({
        name: string()
    }),
    withName("EntityWithoutMaxPerPage"),
    withStorage({
        driver: new CustomDriver()
    })
)();

const EntityWithMaxPerPage = compose(
    withFields({
        name: string()
    }),
    withName("EntityWithMaxPerPage"),
    withStorage({
        driver: new CustomDriver(),
        maxPerPage: 500
    })
)();

const EntityWithMaxPerPageSetToNull = compose(
    withFields({
        name: string()
    }),
    withName("EntityWithMaxPerPage"),
    withStorage({
        driver: new CustomDriver(),
        maxPerPage: null
    })
)();

describe("maxPerPage test", () => {
    test("must throw errors if maxPerPage config parameter was exceeded", async () => {
        await EntityWithoutMaxPerPage.find({ limit: 99 });
        await EntityWithoutMaxPerPage.find({ limit: 100 });

        let error = null;
        try {
            await EntityWithoutMaxPerPage.find({ limit: 101 });
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe("Cannot query for more than 100 models per page.");

        await EntityWithMaxPerPage.find({ limit: 499 });
        await EntityWithMaxPerPage.find({ limit: 500 });

        error = null;
        try {
            await EntityWithMaxPerPage.find({ limit: 501 });
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe("Cannot query for more than 500 models per page.");

        await EntityWithMaxPerPageSetToNull.find({ limit: 100 });

        error = null;
        try {
            await EntityWithoutMaxPerPage.find({ limit: 101 });
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe("Cannot query for more than 100 models per page.");
    });
});
