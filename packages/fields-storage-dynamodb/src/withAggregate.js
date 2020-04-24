// @flow
import { withStaticProps } from "repropose";

export default () => {
    return withStaticProps({
        aggregate(pipeline) {
            const driver = this.getStorageDriver();
            return driver
                .getDatabase()
                .collection(driver.getCollectionName(this))
                .aggregate(pipeline)
                .toArray();
        }
    });
};
