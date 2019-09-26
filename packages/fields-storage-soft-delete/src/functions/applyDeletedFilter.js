export default options => {
    if (!options) {
        return { query: { deleted: { $ne: true } } };
    }

    if ("query" in options) {
        if ("deleted" in options.query) {
            return options;
        }
        options.query.deleted = { $ne: true };
    } else {
        options.query = {
            deleted: { $ne: true }
        };
    }

    return options;
};
