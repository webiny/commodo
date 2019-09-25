// @flow
const hasWithStorage = (value: any): boolean => {
    if (value && value.__withStorage) {
        return true;
    }
    return false;
};

export default hasWithStorage;
