import Model from "./model";
import { withFields, string, object, boolean } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { id } from "@commodo/fields-storage-mongodb";
import { compose } from "ramda";

const VerificationModel = compose(
    withFields({
        verified: boolean(),
        documentType: string({
            validation: () => {
                if (value && !["id", "driversLicense"].includes(value)) {
                    throw Error(`Value must be either "id" or "driversLicense"`);
                }
            }
        })
    })
)(function() {});

const TagModel = compose(
    withFields({
        slug: string(),
        label: string()
    })
)(function() {});

const SimpleModel = compose(
    withName("SimpleModel"),
    withFields({
        name: string()
    })
)(Model);

const ComplexModels2SimpleModels = compose(
    withName("ComplexModels2SimpleModels"),
    withFields({
        complexModel: id(),
        simpleModel: id()
    })
)(Model);

const ComplexModel = compose(
    withFields({
        firstName: string(),
        lastName: string(),
        verification: object({ instanceOf: VerificationModel }),
        tags: object({ list: true, instanceOf: TagModel }),
        simpleModel: ref({ instanceOf: SimpleModel }),
        simpleModels: ref({ list: true, instanceOf: SimpleModel })
    }),
    withName("ComplexModel")
)(Model);

export { VerificationModel, TagModel, ComplexModel, SimpleModel, ComplexModels2SimpleModels };
