import { withFields, string, number, boolean } from "@commodo/fields";
import { withName } from "@commodo/name";
import { withHooks } from "@commodo/hooks";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import createModel from "./createModel";
import required from "./validators/required";

const Image = compose(
    withName("Image"),
    withHooks({
        delete() {
            if (this.markedAsCannotDelete) {
                throw Error("Cannot delete Image model.");
            }
        }
    }),
    withFields(() => ({
        filename: string({
            validation: required
        }),
        size: number(),
        createdBy: ref({ instanceOf: User }),
        markedAsCannotDelete: boolean()
    }))
)(createModel());

const Company = compose(
    withName("Company"),
    withHooks({
        delete() {
            if (this.markedAsCannotDelete) {
                throw Error("Cannot delete Company model.");
            }
        }
    }),
    withFields({
        name: string({
            validation: required
        }),
        image: ref({ instanceOf: Image, autoDelete: true }),
        markedAsCannotDelete: boolean()
    })
)(createModel());

const User = compose(
    withName("User"),
    withHooks({
        delete() {
            if (this.markedAsCannotDelete) {
                throw Error("Cannot delete User model.");
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
        company: ref({ instanceOf: Company, autoDelete: true }),
        markedAsCannotDelete: boolean()
    })
)(createModel());

export { User, Company, Image };
