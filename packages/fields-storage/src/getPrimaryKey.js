import getKeys from "./getKeys";

const getPrimaryKey = model => {
    return getKeys(model).find(item => item.primary);
};

export default getPrimaryKey;
