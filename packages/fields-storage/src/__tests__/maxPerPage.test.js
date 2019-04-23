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
)(function() {});

const EntityWithMaxPerPage = compose(
    withFields({
        name: string()
    }),
    withName("EntityWithMaxPerPage"),
    withStorage({
        driver: new CustomDriver(),
        maxPerPage: 500
    })
)(function() {});

const EntityWithMaxPerPageSetToNull = compose(
    withFields({
        name: string()
    }),
    withName("EntityWithMaxPerPage"),
    withStorage({
        driver: new CustomDriver(),
        maxPerPage: null
    })
)(function() {});

describe("maxPerPage test", () => {
    test("must throw errors if maxPerPage config parameter was exceeded", async () => {
        await EntityWithoutMaxPerPage.find({ perPage: 99 });
        await EntityWithoutMaxPerPage.find({ perPage: 100 });

        let error = null;
        try {
            await EntityWithoutMaxPerPage.find({ perPage: 101 });
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe("Cannot query for more than 100 models per page.");

        await EntityWithMaxPerPage.find({ perPage: 499 });
        await EntityWithMaxPerPage.find({ perPage: 500 });

        error = null;
        try {
            await EntityWithMaxPerPage.find({ perPage: 501 });
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe("Cannot query for more than 500 models per page.");

        await EntityWithMaxPerPageSetToNull.find({ perPage: 100 });

        error = null;
        try {
            await EntityWithoutMaxPerPage.find({ perPage: 101 });
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe("Cannot query for more than 100 models per page.");
    });
});
