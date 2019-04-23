import { compose } from "ramda";
import camelcase from "camelcase";
import { withName } from "@commodo/name";
import { withHooks } from "@commodo/hooks";
import { withFields, string, boolean } from "@commodo/fields";
import Model from "./Model";

const SimpleModel = compose(
    withName("SimpleModel"),
    withHooks({
        beforeSave() {
            if (this.name) {
                this.slug = camelcase(this.name);
            }
        }
    }),
    withFields({
        name: string(),
        slug: string(),
        enabled: boolean({ value: true }),
        tags: string({ list: true })
    })
)(Model);

export default SimpleModel;
