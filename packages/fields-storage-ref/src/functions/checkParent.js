// @flow
import { hasName } from "@commodo/name";
import { hasWithStorage } from "@commodo/fields-storage";

export default ({ parent, name }) => {
    if (!hasWithStorage(parent)) {
        throw Error(`"ref" field ${name} has a parent with no "withStorage" applied.`);
    }

    if (!hasName(parent)) {
        throw Error(`"ref" field ${name} has a parent with no name assigned.`);
    }
};
