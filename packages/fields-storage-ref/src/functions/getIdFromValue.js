export default value => {
    if (!value) {
        return null;
    }

    if (typeof value === "string") {
        return value;
    }

    return value.id;
};
