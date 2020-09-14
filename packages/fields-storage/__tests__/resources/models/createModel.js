import { withStorage, StorageCache } from "@commodo/fields-storage";
import { NeDbDriver, withId } from "@commodo/fields-storage-nedb";
import { compose } from "ramda";

// All entity classes share the same pool.
const globalStorageCache = new StorageCache();
const globalStorageDriver = new NeDbDriver();

const createModel = () =>
    compose(
        withId(),
        withStorage({
            driver: globalStorageDriver,
            pool: globalStorageCache
        })
    )();

export default createModel;
