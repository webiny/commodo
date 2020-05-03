// @flow
import { getName } from "@commodo/name";
import { withStaticProps } from "repropose";

export default () => {
    return withStaticProps({
        aggregate(pipeline) {
            const driver = this.getStorageDriver();
            return driver
                .getDatabase()
                .collection(driver.getCollectionName(getName(this)))
                .aggregate(pipeline)
                .toArray();
        }
    });
};
