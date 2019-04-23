import { withFields, string } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import Model from "./Model";

const ClassC = compose(
    withName("ClassC"),
    withFields({
        name: string()
    })
)(Model);

const ClassB = compose(
    withName("ClassB"),
    withFields({
        name: string(),
        classC: ref({ instanceOf: ClassC })
    })
)(Model);

const ClassA = compose(
    withName("ClassA"),
    withFields({
        name: string(),
        classB: ref({ instanceOf: ClassB })
    })
)(Model);

export { ClassA, ClassB, ClassC };
