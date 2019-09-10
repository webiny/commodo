import { withFields, string } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import createModel from "./createModel";

const Six = compose(
    withName("Six"),
    withFields({
        name: string()
    })
)(createModel());

const Five = compose(
    withName("Five"),
    withFields({
        name: string()
    })
)(createModel());

const Four = compose(
    withName("Four"),
    withFields({
        name: string()
    })
)(createModel());

const Three = compose(
    withName("Three"),
    withFields({
        name: string(),
        four: ref({ instanceOf: Four, autoDelete: true }),
        anotherFour: ref({ instanceOf: Four, autoDelete: true }),
        five: ref({ instanceOf: Five, autoDelete: true }),
        six: ref({ instanceOf: Six, autoDelete: true })
    })
)(createModel());

const Two = compose(
    withName("Two"),
    withFields({
        name: string(),
        three: ref({ instanceOf: Three, autoDelete: true })
    })
)(createModel());

const One = compose(
    withName("One"),
    withFields({
        name: string(),
        two: ref({ instanceOf: Two, autoDelete: true })
    })
)(createModel());

export { One, Two, Three, Four, Five, Six };
