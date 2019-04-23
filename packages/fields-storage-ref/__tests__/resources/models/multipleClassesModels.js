import { withFields, string } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import Model from "./Model";

const A = compose(
    withName("A"),
    withFields({
        name: string()
    })
)(Model);

const B = compose(
    withName("B"),
    withFields({
        name: string()
    })
)(Model);

const C = compose(
    withName("C"),
    withFields({
        name: string()
    })
)(Model);

const Main = compose(
    withName("Main"),
    withFields({
        assignedTo: ref({ instanceOf: [A, B, C], refNameField: "assignedToRefName" }),
        assignedToRefName: string()
    })
)(Model);

const MainMissingRefNameFieldOption = compose(
    withName("MainMissingRefNameFieldOption"),
    withFields({
        assignedTo: ref({ instanceOf: [A, B, C] })
    })
)(Model);

const MainMissingRefNameField = compose(
    withName("MainMissingRefNameField"),
    withFields({
        assignedTo: ref({ instanceOf: [A, B, C], refNameField: "assignedToRefName" }),
        assignedToRefNameEdited: string()
    })
)(Model);

const InvalidEntityClass = compose(
    withName("InvalidEntityClass"),
    withFields({})
)(Model);

export {
    Main,
    MainMissingRefNameFieldOption,
    MainMissingRefNameField,
    InvalidEntityClass,
    A,
    B,
    C
};
