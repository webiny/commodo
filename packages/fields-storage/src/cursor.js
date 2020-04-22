import qs from "querystring";

export const encodeCursor = cursor => {
    if (!cursor) {
        return null;
    }

    const data = {};
    Object.keys(cursor).forEach(key => {
        const value = cursor[key];
        if (typeof value === "number") {
            data[`${key}:n`] = value;
            return;
        }

        switch (value.constructor.name) {
            case "Date":
                data[`${key}:d`] = value.getTime();
                break;
            case "Boolean":
                data[`${key}:b`] = value === true ? 1 : 0;
                break;
            default:
                data[key] = value;
        }
    });

    return Buffer.from(qs.encode(data)).toString("base64");
};

export const decodeCursor = cursor => {
    if (!cursor) {
        return null;
    }

    const query = qs.decode(Buffer.from(cursor, "base64").toString("ascii"));

    const data = {};
    Object.keys(query).forEach(qKey => {
        const value = query[qKey];
        const [key, type] = qKey.split(":");

        switch (type) {
            case "d":
                data[key] = new Date(parseInt(value));
                break;
            case "n":
                data[key] = value.includes(".") ? parseFloat(value) : parseInt(value);
                break;
            case "b":
                data[key] = value !== "0";
                break;
            default:
                data[key] = value;
        }
    });

    return data;
};
