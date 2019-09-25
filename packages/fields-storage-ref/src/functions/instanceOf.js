import { getName } from "@commodo/name";

export default (instance, instanceOf) => {
    if (Array.isArray(instanceOf)) {
        for (let i = 0; i < instanceOf.length; i++) {
            let instanceOfElement = instanceOf[i];
            if (getName(instance) === getName(instanceOfElement)) {
                return true;
            }
        }
        return false;
    }
    return getName(instance) === getName(instanceOf);
};
