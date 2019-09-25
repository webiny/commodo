import { withFields, string } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import createModel from "./createModel";

const Six = compose(
    withFields({
        name: string()
    }),
    withName("Six")
)(createModel());

const Five = compose(
    withFields({
        name: string()
    }),
    withName("Five")
)(createModel());

const Four = compose(
    withFields({
        name: string()
    }),
    withName("Four")
)(createModel());

const Three = compose(
    withFields({
        name: string(),
        four: ref({ instanceOf: Four, autoDelete: true }),
        anotherFour: ref({ instanceOf: Four, autoDelete: true }),
        five: ref({ instanceOf: Five, autoDelete: true }),
        six: ref({ instanceOf: Six, autoDelete: true })
    }),
    withName("Three")
)(createModel());

const Two = compose(
    withFields({
        name: string(),
        three: ref({ instanceOf: Three, autoDelete: true })
    }),
    withName("Two")
)(createModel());

const One = compose(
    withFields({
        name: string(),
        two: ref({ instanceOf: Two, autoDelete: true })
    }),
    withName("One")
)(createModel());

export { One, Two, Three, Four, Five, Six };
