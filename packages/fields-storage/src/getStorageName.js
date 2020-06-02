// @flow
const getStorageName = (value: any): string => {
    if (value && value.__withStorageName) {
        return value.__withStorageName;
    }
    return "";
};

export default getStorageName;
