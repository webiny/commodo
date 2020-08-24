import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { withStorage } from "@commodo/fields-storage";
import { DynamoDbDriver } from "@commodo/fields-storage-dynamodb";
import { compose } from "ramda";

// Models.
import simpleModel from "./SimpleModel";

export default ({ init = true } = {}) => {
    const self = {
        models: {},
        documentClient: null,
        beforeAll: () => {
            self.documentClient = new DocumentClient({
                convertEmptyValues: true,
                endpoint: "localhost:8000",
                sslEnabled: false,
                region: "local-env"
            });

            const base = () =>
                compose(
                    withStorage({
                        driver: new DynamoDbDriver({
                            documentClient: self.documentClient,
                            tableName: "pk-sk"
                        })
                    })
                )();

            Object.assign(self.models, {
                SimpleModel: simpleModel(base)
            });
        },
        getDocumentClient() {
            return self.documentClient;
        }
    };

    if (init !== false) {
        beforeAll(self.beforeAll);
    }

    return self;
};
