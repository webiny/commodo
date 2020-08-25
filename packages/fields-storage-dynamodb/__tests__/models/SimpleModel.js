import { compose } from "ramda";
import camelcase from "camelcase";
import { withName } from "@commodo/name";
import { withHooks } from "@commodo/hooks";
import { withFields, string, boolean, number } from "@commodo/fields";
import { withPrimaryKey } from "@commodo/fields-storage";

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
        withPrimaryKey("pk", "sk"),
        withFields({
            pk: string(),
            sk: string(),
            name: string(),
            slug: string(),
            enabled: boolean({ value: true }),
            tags: string({ list: true }),
            age: number()
        })
    )(base());
