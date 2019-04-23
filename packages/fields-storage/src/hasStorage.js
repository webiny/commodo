// @flow
const hasFields = (value: any): boolean => {
    if (value && value.__withStorage) {
        return true;
    }
    return false;
};

export default hasFields;
