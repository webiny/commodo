// @flow

const MAX_PER_PAGE_EXCEEDED = "MAX_PER_PAGE_EXCEEDED";
const POPULATE_FAILED_NOT_OBJECT = "POPULATE_FAILED_NOT_OBJECT";
const STORAGE_DRIVER_MISSING = "STORAGE_DRIVER_MISSING";

export default class WithStorageError extends Error {
    static MAX_PER_PAGE_EXCEEDED: string;
    static POPULATE_FAILED_NOT_OBJECT: string;
    static STORAGE_DRIVER_MISSING: string;

    message: string;
    code: string;
    data: ?Object;
    constructor(message: string = "", code: string = "", data: ?Object = null) {
        super();
        this.message = message;
        this.code = code;
        this.data = data;
    }
}

WithStorageError.MAX_PER_PAGE_EXCEEDED = MAX_PER_PAGE_EXCEEDED;
WithStorageError.POPULATE_FAILED_NOT_OBJECT = POPULATE_FAILED_NOT_OBJECT;
WithStorageError.CANNOT_STORAGE_DRIVER_MISSINGDELETE_NO_ID = STORAGE_DRIVER_MISSING;
