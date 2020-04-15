// @flow
import { Collection } from "@commodo/fields-storage";
import { encodeCursor } from "./cursor";

type PaginationMeta = {
    cursors: {
        next: string | null,
        previous: string | null
    },
    hasNextPage: boolean,
    hasPreviousPage: boolean,
    totalCount?: number
};

type Params = {
    collection: Collection,
    hasPreviousPage: boolean,
    hasNextPage: boolean,
    totalCount?: number
};

export default (params: ?Params): PaginationMeta => {
    const { collection, hasNextPage, hasPreviousPage, ...rest } = params;
    let next = null;
    let previous = null;

    if (collection.length) {
        next = hasNextPage ? collection[collection.length - 1].id : null;
        previous = hasPreviousPage ? collection[0].id : null;
    }

    const meta: PaginationMeta = {
        ...rest,
        hasNextPage,
        hasPreviousPage,
        cursors: {
            next: encodeCursor(next),
            previous: encodeCursor(previous)
        }
    };

    return meta;
};
