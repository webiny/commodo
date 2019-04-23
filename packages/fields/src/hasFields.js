// @flow
const hasFields = (value: any): boolean => {
    if (value && value.__withFields) {
        return true;
    }
    return false;
};

export default hasFields;
