import { withFields, string } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import createModel from "./createModel";

const A = compose(
    withName("A"),
    withFields({
        name: string()
    })
)(createModel());

const B = compose(
    withName("B"),
    withFields({
        name: string()
    })
)(createModel());

const C = compose(
    withName("C"),
    withFields({
        name: string()
    })
)(createModel());

const Main = compose(
    withName("Main"),
    withFields({
        assignedTo: ref({ instanceOf: [A, B, C], refNameField: "assignedToRefName" }),
        assignedToRefName: string()
    })
)(createModel());

const MainMissingRefNameFieldOption = compose(
    withName("MainMissingRefNameFieldOption"),
    withFields({
        assignedTo: ref({ instanceOf: [A, B, C] })
    })
)(createModel());

const MainMissingRefNameField = compose(
    withName("MainMissingRefNameField"),
    withFields({
        assignedTo: ref({ instanceOf: [A, B, C], refNameField: "assignedToRefName" }),
        assignedToRefNameEdited: string()
    })
)(createModel());

const InvalidEntityClass = compose(
    withName("InvalidEntityClass"),
    withFields({})
)(createModel());

export {
    Main,
    MainMissingRefNameFieldOption,
    MainMissingRefNameField,
    InvalidEntityClass,
    A,
    B,
    C
};
