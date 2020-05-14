// @flow
import { withProps, withStaticProps } from "repropose";
import { withFields, skipOnPopulate, boolean } from "@commodo/fields";
import { getName } from "@commodo/name";
import applyDeletedFilter from "./functions/applyDeletedFilter";

export default () => {
    return baseFn => {
        withFields({
            deleted: skipOnPopulate()(boolean({ value: false }))
        })(baseFn);

        withProps({
            async delete(options: ?Object) {
                if (this.__withStorage.processing) {
                    return;
                }

                this.__withStorage.processing = "delete";

                options = {
                    ...options,
                    hooks: {}
                };

                try {
                    await this.hook("delete", { options, model: this });

                    options.validation !== false && (await this.validate());

                    await this.hook("beforeDelete", { options, model: this });

                    this.deleted = true;
                    await this.getStorageDriver().update([
                        {
                            name: getName(this),
                            data: {
                                ...(await this.toStorage()),
                                id: this.id
                            },
                            options
                        }
                    ]);

                    await this.hook("afterDelete", { options, model: this });

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
