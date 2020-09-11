import { withFields, string } from "@commodo/fields";
import { withStorage } from "@commodo/fields-storage";
import { withName } from "@commodo/name";
import { compose } from "ramda";
import { NeDbDriver } from "@commodo/fields-storage-nedb";

const EntityWithoutMaxLimit = compose(
    withFields({
        name: string()
    }),
    withName("EntityWithoutMaxLimit"),
    withStorage({
        driver: new NeDbDriver()
    })
)();

const EntityWithMaxLimit = compose(
    withFields({
        name: string()
    }),
    withName("EntityWithMaxLimit"),
    withStorage({
        driver: new NeDbDriver(),
        maxLimit: 500
    })
)();

describe("maxLimit test", () => {
    test("must throw errors if maxLimit config parameter was exceeded", async () => {
        await EntityWithoutMaxLimit.find({ limit: 99 });
        await EntityWithoutMaxLimit.find({ limit: 999999 });

        let error = null;
        try {
            await EntityWithMaxLimit.find({ limit: 501 });
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe(`Cannot set a limit greater than "500". Please adjust the "maxLimit" argument if needed.`);
    });
});
