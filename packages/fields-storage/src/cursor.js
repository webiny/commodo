export const encodeCursor = cursor => {
    if (typeof cursor === "string") {
        return Buffer.from(cursor).toString("base64");
    }

    return null;
};

export const decodeCursor = cursor => {
    if (typeof cursor === "string") {
        return Buffer.from(cursor, "base64").toString("ascii");
    }

    return null;
};
