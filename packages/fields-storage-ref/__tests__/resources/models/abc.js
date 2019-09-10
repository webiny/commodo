import { withFields, string } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import createModel from "./createModel";

const ClassC = compose(
    withName("ClassC"),
    withFields({
        name: string()
    })
)(createModel());

const ClassB = compose(
    withName("ClassB"),
    withFields({
        name: string(),
        classC: ref({ instanceOf: ClassC })
    })
)(createModel());

const ClassA = compose(
    withName("ClassA"),
    withFields({
        name: string(),
        classB: ref({ instanceOf: ClassB })
    })
)(createModel());

export { ClassA, ClassB, ClassC };
