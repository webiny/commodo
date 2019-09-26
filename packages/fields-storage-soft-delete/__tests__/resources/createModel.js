import { withStorage, StoragePool } from "@commodo/fields-storage";
import { compose } from "ramda";
import { CustomDriver, withId } from "./CustomDriver";
import { withSoftDelete } from "@commodo/fields-storage-soft-delete";
import { withName } from "@commodo/name";

// All entity classes share the same pool.
const globalStoragePool = new StoragePool();
const globalStorageDriver = new CustomDriver();

const createModel = base =>
    compose(
        withId(),
        withSoftDelete(),
        withStorage({
            driver: globalStorageDriver,
            pool: globalStoragePool
        }),
        withName("BlankModel"),
    )(base);

export default createModel;
