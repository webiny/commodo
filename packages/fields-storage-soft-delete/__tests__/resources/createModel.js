import { withStorage, StorageCache } from "@commodo/fields-storage";
import { compose } from "ramda";
import { withSoftDelete } from "@commodo/fields-storage-soft-delete";
import { withName } from "@commodo/name";
import { NeDbDriver, withId } from "@commodo/fields-storage-nedb";

// All entity classes share the same pool.
const globalStorageCache = new StorageCache();
const globalStorageDriver = new NeDbDriver();

const createModel = base =>
    compose(
        withSoftDelete(),
        withId(),
        withStorage({
            driver: globalStorageDriver,
            pool: globalStorageCache
        }),
        withName("BlankModel")
    )(base);

export default createModel;
