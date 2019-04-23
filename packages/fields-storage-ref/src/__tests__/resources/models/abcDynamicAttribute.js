import { withFields, string } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import Model from "./Model";

const ClassCDynamic = compose(
    withName("ClassCDynamic"),
    withFields({
        name: string(),
    })
)(Model);

const ClassBDynamic = compose(
    withName("ClassBDynamic"),
    withFields({
        name: string(),
        classCDynamic: ref({instanceOf: ClassCDynamic})
    })
)(Model);

const ClassADynamic = compose(
    withName("ClassADynamic"),
    withFields({
        name: string(),
        classBDynamic: ref({instanceOf: ClassBDynamic})
    })
)(Model);

export { ClassADynamic, ClassBDynamic, ClassCDynamic };
