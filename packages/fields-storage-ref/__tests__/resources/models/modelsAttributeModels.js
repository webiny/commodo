import { withFields, string, number, boolean, setOnce } from "@commodo/fields";
import { withName } from "@commodo/name";
import { withHooks } from "@commodo/hooks";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import createModel from "./createModel";
import required from "./validators/required";

const Entity1 = compose(
    withFields({
        name: string({
            validation: required
        }),
        number: number(),
        type: string({
            validation: value => {
                if (value && !["cat", "dog", "mouse", "parrot"].includes(value)) {
                    throw new Error("Value must be one of the following: cat, dog, mouse, parrot.");
                }
            }
        }),
        markedAsCannotDelete: boolean()
    }),
    withName("Entity1"),
    withHooks({
        delete() {
            if (this.markedAsCannotDelete) {
                throw Error("Cannot delete Entity1 model");
            }
        }
    })
)(createModel());

const Entity2 = compose(
    withHooks({
        delete() {
            if (this.markedAsCannotDelete) {
                throw Error("Cannot delete Entity2 model");
            }
        }
    }),
    withFields({
        firstName: string({
            validation: required
        }),
        lastName: string({
            validation: required
        }),
        enabled: boolean(),
        markedAsCannotDelete: boolean(),
        model1Entities: ref({ list: true, instanceOf: Entity1 })
    }),
    withName("Entity2")
)(createModel());

const MainEntity = compose(
    withFields({
        attribute1: ref({ list: true, instanceOf: Entity1 }),
        attribute2: ref({ list: true, instanceOf: Entity2 })
    }),
    withName("MainEntity")
)(createModel());

const MainSetOnceEntity = compose(
    withFields({
        attribute1: setOnce()(ref({ list: true, instanceOf: Entity1 })),
        attribute2: ref({ list: true, instanceOf: Entity2 })
    }),
    withName("MainSetOnceEntity")
)(createModel());

const MainEntityWithStorage = compose(
    withFields({
        attribute1: ref({ list: true, instanceOf: Entity1, toStorage: true }),
        attribute2: ref({ list: true, instanceOf: Entity2, toStorage: true })
    }),
    withName("MainEntityWithStorage")
)(createModel());

export { Entity1, Entity2, MainEntity, MainSetOnceEntity, MainEntityWithStorage };
