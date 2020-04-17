// @flow
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
    nextCursor: Object,
    previousCursor: Object,
    hasPreviousPage: boolean,
    hasNextPage: boolean,
    totalCount?: number
};

export default (params: ?Params): PaginationMeta => {
    const { nextCursor, previousCursor, hasNextPage, hasPreviousPage, ...rest } = params;

    const meta: PaginationMeta = {
        ...rest,
        hasNextPage,
        hasPreviousPage,
        cursors: {
            next: encodeCursor(nextCursor),
            previous: encodeCursor(previousCursor)
        }
    };

    return meta;
};
