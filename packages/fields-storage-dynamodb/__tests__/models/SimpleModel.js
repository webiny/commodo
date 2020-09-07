import { compose } from "ramda";
import camelcase from "camelcase";
import { withName } from "@commodo/name";
import { withHooks } from "@commodo/hooks";
import { withFields, string, boolean, number } from "@commodo/fields";
import { withPrimaryKey, withUniqueKey } from "@commodo/fields-storage";

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
        withUniqueKey("gsi1pk", "gsi1sk"),
        withUniqueKey("gsi2pk", "gsi2sk"),
        withFields({
            pk: string(),
            sk: string(),
            gsi1pk: string(),
            gsi1sk: string(),
            gsi2pk: string(),
            gsi2sk: string(),
            name: string(),
            slug: string(),
            enabled: boolean({ value: true }),
            tags: string({ list: true }),
            age: number()
        })
    )(base());
