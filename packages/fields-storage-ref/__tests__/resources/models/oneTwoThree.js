import { withFields, string } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import Model from "./Model";

const Six = compose(
    withName("Six"),
    withFields({
        name: string(),
    })
)(Model);

const Five = compose(
    withName("Five"),
    withFields({
        name: string(),
    })
)(Model);

const Four = compose(
    withName("Four"),
    withFields({
        name: string(),
    })
)(Model);

const Three = compose(
    withName("Three"),
    withFields({
        name: string(),
        four: ref({ instanceOf: Four, autoDelete: true }),
        anotherFour: ref({ instanceOf: Four, autoDelete: true }),
        five: ref({ instanceOf: Five, autoDelete: true }),
        six: ref({ instanceOf: Six, autoDelete: true }),
    })
)(Model);

const Two = compose(
    withName("Two"),
    withFields({
        name: string(),
        three: ref({ instanceOf: Three, autoDelete: true })
    })
)(Model);

const One = compose(
    withName("One"),
    withFields({
        name: string(),
        two: ref({ instanceOf: Two, autoDelete: true })
    })
)(Model);

export { One, Two, Three, Four, Five, Six };
