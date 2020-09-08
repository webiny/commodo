// @flow
import { withProps, withStaticProps } from "repropose";
import { withFields, skipOnPopulate, boolean } from "@commodo/fields";
import applyDeletedFilter from "./functions/applyDeletedFilter";
import getPrimaryKey from "@commodo/fields-storage/getPrimaryKey";

export default () => {
    return baseFn => {
        withFields({
            deleted: skipOnPopulate()(boolean({ value: false }))
        })(baseFn);

        withProps({
            async delete(args) {
                const primaryKey = getPrimaryKey(this);
                if (!primaryKey) {
                    throw Error(
                        `Cannot delete "${this.getStorageName()}" model, no primary key defined.`
                    );
                }

                if (this.__withStorage.processing) {
                    return;
                }

                this.__withStorage.processing = "delete";

                args = {
                    ...args,
                    hooks: {}
                };

                try {

                    await this.hook("delete", { options: args, model: this });

                    args.validation !== false && (await this.validate());

                    await this.hook("beforeDelete", { options: args, model: this });

                    this.deleted = true;

                    const query = {};
                    for (let i = 0; i < primaryKey.fields.length; i++) {
                        let field = primaryKey.fields[i];
                        query[field.name] = this[field.name];
                    }

                    await this.constructor.update({
                        batch: args.batch,
                        instance: this,
                        data: await this.toStorage(),
                        query
                    });

                    await this.hook("afterDelete", { options: args, model: this });

                    this.constructor.getStoragePool().remove(this);
                } catch (e) {
                    throw e;
                } finally {
                    this.__withStorage.processing = null;
                }
            }
        })(baseFn);

        withStaticProps(({ find, findOne, count }) => ({
            async find(options: ?Object) {
                return find.call(this, applyDeletedFilter(options));
            },
            async findOne(options: ?Object) {
                return findOne.call(this, applyDeletedFilter(options));
            },
            async count(options: ?Object) {
                return count.call(this, applyDeletedFilter(options));
            }
        }))(baseFn);

        return baseFn;
    };
};
