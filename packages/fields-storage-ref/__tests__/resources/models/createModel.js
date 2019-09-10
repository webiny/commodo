import { withStorage, StoragePool } from "@commodo/fields-storage";
import { compose } from "ramda";
import { CustomDriver, withId } from "./../CustomDriver";

// All entity classes share the same pool.
const globalStoragePool = new StoragePool();
const globalStorageDriver = new CustomDriver();

const createModel = base =>
    compose(
        withId(),
        withStorage({
            driver: globalStorageDriver,
            pool: globalStoragePool
        })
    )(base);

export default createModel;
