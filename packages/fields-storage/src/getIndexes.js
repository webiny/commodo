// @flow
const getIndexes = (value: any): string => {
    if (value && value.__withIndexes) {
        return value.__withIndexes;
    }
    return null;
};

export default getIndexes;