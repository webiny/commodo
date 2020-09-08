import { withStorage, StoragePool } from "@commodo/fields-storage";
import { NeDbDriver, withId } from "@commodo/fields-storage-nedb";
import { compose } from "ramda";

// All entity classes share the same pool.
const globalStoragePool = new StoragePool();
const globalStorageDriver = new NeDbDriver();

const createModel = () =>
    compose(
        withId(),
        withStorage({
            driver: globalStorageDriver,
            pool: globalStoragePool
        })
    )();

export default createModel;
