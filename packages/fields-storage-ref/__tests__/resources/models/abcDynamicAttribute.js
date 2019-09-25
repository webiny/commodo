import { withFields, string } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import createModel from "./createModel";

const ClassCDynamic = compose(
    withFields({
        name: string()
    }),
    withName("ClassCDynamic")
)(createModel());

const ClassBDynamic = compose(
    withFields({
        name: string(),
        classCDynamic: ref({ instanceOf: ClassCDynamic })
    }),
    withName("ClassBDynamic")
)(createModel());

const ClassADynamic = compose(
    withFields({
        name: string(),
        classBDynamic: ref({ instanceOf: ClassBDynamic })
    }),
    withName("ClassADynamic")
)(createModel());

export { ClassADynamic, ClassBDynamic, ClassCDynamic };
