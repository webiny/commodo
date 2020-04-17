import { compose } from "ramda";
import camelcase from "camelcase";
import { withName } from "@commodo/name";
import { withHooks } from "@commodo/hooks";
import { withFields, string, boolean, number } from "@commodo/fields";

export default base =>
    compose(
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
            tags: string({ list: true }),
            age: number()
        })
    )(base());
