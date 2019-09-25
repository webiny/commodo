import { withFields, string } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import createModel from "./createModel";

const A = compose(
    withFields({
        name: string()
    }),
    withName("A")
)(createModel());

const B = compose(
    withFields({
        name: string()
    }),
    withName("B")
)(createModel());

const C = compose(
    withFields({
        name: string()
    }),
    withName("C")
)(createModel());

const Main = compose(
    withFields({
        assignedTo: ref({ instanceOf: [A, B, C], refNameField: "assignedToRefName" }),
        assignedToRefName: string()
    }),
    withName("Main")
)(createModel());

const MainMissingRefNameFieldOption = compose(
    withFields({
        assignedTo: ref({ instanceOf: [A, B, C] })
    }),
    withName("MainMissingRefNameFieldOption")
)(createModel());

const MainMissingRefNameField = compose(
    withFields({
        assignedTo: ref({ instanceOf: [A, B, C], refNameField: "assignedToRefName" }),
        assignedToRefNameEdited: string()
    }),
    withName("MainMissingRefNameField")
)(createModel());

const InvalidEntityClass = compose(
    withFields({}),
    withName("InvalidEntityClass")
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
