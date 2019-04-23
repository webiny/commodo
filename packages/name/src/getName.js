// @flow
const getName = (value: any): string => {
    if (value && value.__withName) {
        return value.__withName;
    }
    return "";
};

export default getName;
