import mongodb, { MongoClient } from "mongodb";
import { withStorage } from "@commodo/fields-storage";
import { MongoDbDriver, withId } from "@commodo/fields-storage-mongodb";
import { compose, pick } from "ramda";

// Models.
import simpleModel from "./SimpleModel";

export default ({ init = true } = {}) => {
    const self = {
        models: {},
        db: null,
        connection: null,
        getDatabase() {
            return self.db;
        },
        getConnection() {
            return self.connection;
        },
        getCollection(name) {
            const collection = self.getDatabase().collection(name);
            const __find = collection.find.bind(collection);
            collection.find = (...args) => {
                const cursor = __find(...args);
                cursor.toSimpleArray = async () => {
                    const array = await cursor.toArray();
                    return array.map(item => {
                        const output = pick(Object.keys(item), item);
                        if (typeof output._id !== "undefined") {
                            output._id = String(output._id);
                        }
                        return output;
                    });
                };
                return cursor;
            };

            return collection;
        },
        beforeAll: async () => {
            self.connection = await MongoClient.connect(global.__MONGO_URI__, {
                useNewUrlParser: true
            });
            self.db = await self.connection.db(global.__MONGO_DB_NAME__);
            self.getDatabase().dropDatabase();

            const base = () =>
                compose(
                    withId(),
                    withStorage({
                        driver: new MongoDbDriver({
                            database: self.db
                        })
                    })
                )();

            Object.assign(self.models, { SimpleModel: simpleModel(base) });
        },
        afterAll: async () => {
            await self.getCollection().close();
            await self.getDatabase().close();
        }
    };

    if (init !== false) {
        beforeAll(self.beforeAll);
        afterAll(self.afterAll);
    }

    return self;
};
