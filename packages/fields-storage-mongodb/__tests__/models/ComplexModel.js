import { withFields, string, fields, boolean } from "@commodo/fields";
import { withName } from "@commodo/name";
import { compose } from "ramda";

export default base => {
    const VerificationModel = compose(
        withFields({
            verified: boolean(),
            documentType: string({
                validation: value => {
                    if (value && !["id", "driversLicense"].includes(value)) {
                        throw Error(`Value must be either "id" or "driversLicense"`);
                    }
                }
            })
        })
    )();

    const TagModel = compose(
        withFields({
            slug: string(),
            label: string()
        })
    )();

    const ComplexModel = compose(
        withFields(() => ({
            firstName: string(),
            lastName: string(),
            verification: fields({ instanceOf: VerificationModel }),
            tags: fields({ list: true, instanceOf: TagModel }),
        })),
        withName("ComplexModel")
    )(base());

    return { VerificationModel, TagModel, ComplexModel };
};
