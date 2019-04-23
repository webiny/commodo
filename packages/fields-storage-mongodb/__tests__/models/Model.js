import { withStorage } from "@commodo/fields-storage";
import { MongoDbDriver, withId } from "@commodo/fields-storage-mongodb";
import { database } from "./../database";
import { compose } from "ramda";

const Model = compose(
    withId(),
    withStorage({
        driver: new MongoDbDriver({
            database
        })
    })
)(function() {});

export default Model;
