import { withFields, string } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import createModel from "./createModel";

const ClassCDynamic = compose(
    withName("ClassCDynamic"),
    withFields({
        name: string()
    })
)(createModel());

const ClassBDynamic = compose(
    withName("ClassBDynamic"),
    withFields({
        name: string(),
        classCDynamic: ref({ instanceOf: ClassCDynamic })
    })
)(createModel());

const ClassADynamic = compose(
    withName("ClassADynamic"),
    withFields({
        name: string(),
        classBDynamic: ref({ instanceOf: ClassBDynamic })
    })
)(createModel());

export { ClassADynamic, ClassBDynamic, ClassCDynamic };
