// @flow
import getName from "./getName";
const hasName = (value: any, name: ?string): boolean => {
    if (value && typeof value.__withName === "string") {
        if (name) {
            return getName(value) === name;
        }
        return true;
    }
    return false;
};

export default hasName;
