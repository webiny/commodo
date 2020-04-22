import { withFields, string, boolean, number } from "@commodo/fields";
import { withName } from "@commodo/name";
import withStorage from "../../src/withStorage";
import { MongoDbDriver, withId } from "@commodo/fields-storage-mongodb";
import { withCrudLogs } from "commodo-fields-storage-crud-logs";
import pipe from "ramda/src/pipe";

export const createModel = database => {
    return pipe(
        withName("SimpleModel"),
        withId(),
        withCrudLogs(),
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
