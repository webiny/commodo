// @flow
const hasHooks = (value: any): boolean => {
    if (value && value.__withHooks) {
        return true;
    }
    return false;
};

export default hasHooks;
