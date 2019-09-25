import { withFields, string } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import createModel from "./createModel";

const ClassC = compose(
    withFields({
        name: string()
    }),
    withName("ClassC")
)(createModel());

const ClassB = compose(
    withFields({
        name: string(),
        classC: ref({ instanceOf: ClassC })
    }),
    withName("ClassB")
)(createModel());

const ClassA = compose(
    withFields({
        name: string(),
        classB: ref({ instanceOf: ClassB })
    }),
    withName("ClassA")
)(createModel());

export { ClassA, ClassB, ClassC };
