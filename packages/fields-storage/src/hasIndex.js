// @flow
import getIndexes from './getIndexes';

const hasIndex = (value: any, index: ?string): boolean => {
    const indexes = getIndexes(value);
    if (indexes) {
        const indexesNames = Object.keys(indexes);

        if (index) {
            return indexesNames.includes(index);
        }

        return indexesNames.length > 0;
    }
    return false;
};

export default hasIndex;
