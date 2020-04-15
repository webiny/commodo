import { withFields, string, boolean, number } from "@commodo/fields";
import { withName } from "@commodo/name";
import withStorage from "../../src/withStorage";
import { MongoDbDriver, withId } from "@commodo/fields-storage-mongodb";
import pipe from "ramda/src/pipe";

export const createModel = database => {
    return pipe(
        withName("SimpleModel"),
        withId(),
        withFields({
            name: string(),
            slug: string(),
            price: number(),
            enabled: boolean({ value: true })
        }),
        withStorage({
            driver: new MongoDbDriver({
                database,
                aggregateTotalCount: false
            })
        })
    )();
};
