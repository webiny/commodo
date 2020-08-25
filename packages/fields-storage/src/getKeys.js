const getPrimaryKey = model => {
    if (Array.isArray(model.__storageKeys)) {
        return model.__storageKeys;
    }

    if (model.constructor && Array.isArray(model.constructor.__storageKeys)) {
        return model.constructor.__storageKeys;
    }

    return [];
};

export default getPrimaryKey;
