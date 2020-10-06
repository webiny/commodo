export const encodeCursor = cursor => {
    if (!cursor) {
        return null;
    }

    return Buffer.from(JSON.stringify(cursor)).toString("base64");
};

export const decodeCursor = cursor => {
    if (!cursor) {
        return null;
    }

    const value = JSON.parse(Buffer.from(cursor, "base64").toString("ascii"));

    if (value && typeof value === "object") {
        for (let key in value) {
            if (typeof key !== "string") {
                continue;
            }

            const possibleDate = new Date(value[key]);
            try {
                if (possibleDate.toISOString() === value[key]) {
                    value[key] = possibleDate;
                }
            } catch {
                // Do nothing.
            }
        }
    }
    return value;
};
