import findPkgDir from "find-pkg-dir";
import { setup, startDb, stopDb, createTables, deleteTables } from "jest-dynalite";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { withStorage } from "@commodo/fields-storage";
import { DynamoDbDriver, withId } from "@commodo/fields-storage-dynamodb";
import { compose } from "ramda";

// Models
import simpleModel from "./SimpleModel";
import complexModel from "./ComplexModel";

export default ({ init = true } = {}) => {
    let ddb;
    const self = {
        models: {},
        getDynamoDB: () => {
            if (!ddb) {
                ddb = new DocumentClient({
                    ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
                        endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
                        sslEnabled: false,
                        region: "local"
                    })
                });
            }

            return ddb;
        },
        __beforeAll: async () => {
            // Load config from `jest-dynalite-config.json`
            await setup(findPkgDir(__dirname));
            await startDb();
            await createTables();

            const base = () =>
                compose(
                    withId(),
                    withStorage({
                        driver: new DynamoDbDriver({
                            database: self.getDynamoDB()
                        })
                    })
                )();

            Object.assign(self.models, {
                SimpleModel: simpleModel(base),
                ...complexModel(base)
            });
        },
        __afterAll: async () => {
            await deleteTables();
            await stopDb();
        }
    };

    if (init !== false) {
        beforeAll(self.__beforeAll);
        afterAll(self.__afterAll);
    }

    return self;
};
