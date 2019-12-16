// @flow
import { withStaticProps, withProps } from "repropose";
import { withHooks } from "@commodo/hooks";
import type { SaveParams } from "@commodo/fields-storage/types";
import WithStorageError from "./WithStorageError";
import createPaginationMeta from "./createPaginationMeta";
import Collection from "./Collection";
import StoragePool from "./StoragePool";
import FieldsStorageAdapter from "./FieldsStorageAdapter";

interface IStorageDriver {}

type Configuration = {
    storagePool?: StoragePool,
    driver?: IStorageDriver,
    maxPerPage: ?number
};

const defaults = {
    save: {
        hooks: {}
    },
    delete: {
        hooks: {}
    }
};

const hook = async (name, { options, model }) => {
    if (options.hooks[name] === false) {
        return;
    }
    await model.hook(name, { model, options });
};

const registerSaveUpdateCreateHooks = async (prefix, { existing, model, options }) => {
    await hook(prefix + "Save", { model, options });
    if (existing) {
        await hook(prefix + "Update", { model, options });
    } else {
        await hook(prefix + "Create", { model, options });
    }
};

type FindParams = Object & {
    perPage: ?number,
    page: ?number
};

const withStorage = (configuration: Configuration) => {
    return baseFn => {
        let fn = withHooks({
            delete() {
                if (!this.id) {
                    throw new WithStorageError(
                        "Cannot delete before saving to storage.",
                        WithStorageError.CANNOT_DELETE_NO_ID
                    );
                }
            }
        })(baseFn);

        fn = withProps(props => ({
            __withStorage: {
                existing: false,
                processing: false,
                fieldsStorageAdapter: new FieldsStorageAdapter()
            },
            isId(value) {
                return this.constructor.getStorageDriver().isId(value);
            },
            isExisting() {
                return this.__withStorage.existing;
            },
            setExisting(existing: boolean = true) {
                this.__withStorage.existing = existing;
                return this;
            },
            async save(options: ?SaveParams): Promise<void> {
                options = { ...options, ...defaults.save };

                if (this.__withStorage.processing) {
                    return;
                }

                this.__withStorage.processing = "save";

                const existing = this.isExisting();

                await registerSaveUpdateCreateHooks("before", { existing, model: this, options });

                try {
                    await hook("__save", { model: this, options });
                    if (existing) {
                        await hook("__update", { model: this, options });
                    } else {
                        await hook("__create", { model: this, options });
                    }

                    options.validation !== false && (await this.validate());

                    await registerSaveUpdateCreateHooks("__before", {
                        existing,
                        model: this,
                        options
                    });

                    if (this.isDirty()) {
                        await this.getStorageDriver().save({
                            isUpdate: existing,
                            isCreate: !existing,
                            model: this
                        });
                    }

                    await registerSaveUpdateCreateHooks("__after", {
                        existing,
                        model: this,
                        options
                    });

                    this.setExisting();
                    this.clean();

                    this.constructor.getStoragePool().add(this);
                } catch (e) {
                    throw e;
                } finally {
                    this.__withStorage.processing = null;
                }

                await registerSaveUpdateCreateHooks("after", { existing, model: this, options });
            },

            /**
             * Deletes current and all linked models (if autoDelete on the attribute was enabled).
             * @param options
             */
            async delete(options: ?Object) {
                if (this.__withStorage.processing) {
                    return;
                }

                this.__withStorage.processing = "delete";

                options = { ...options, ...defaults.delete };

                try {
                    await this.hook("delete", { options, model: this });

                    options.validation !== false && (await this.validate());

                    await this.hook("beforeDelete", { options, model: this });

                    await this.getStorageDriver().delete({ model: this, options });
                    await this.hook("afterDelete", { options, model: this });

                    this.constructor.getStoragePool().remove(this);
                } catch (e) {
                    throw e;
                } finally {
                    props.__withStorage.processing = null;
                }
            },

            getStorageDriver() {
                return this.constructor.__withStorage.driver;
            },

            async populateFromStorage(data: Object) {
                await this.__withStorage.fieldsStorageAdapter.fromStorage({
                    data,
                    fields: this.getFields()
                });
                return this;
            },

            async toStorage() {
                return this.__withStorage.fieldsStorageAdapter.toStorage({
                    fields: this.getFields()
                });
            }
        }))(fn);

        fn = withStaticProps(() => {
            const __withStorage = {
                ...configuration
            };

            if (!__withStorage.driver) {
                throw new WithStorageError(
                    `Storage driver missing.`,
                    WithStorageError.STORAGE_DRIVER_MISSING
                );
            }

            __withStorage.driver =
                typeof __withStorage.driver === "function"
                    ? __withStorage.driver(this)
                    : __withStorage.driver;

            if (configuration.pool) {
                __withStorage.storagePool =
                    typeof __withStorage.pool === "function"
                        ? __withStorage.pool(this)
                        : __withStorage.pool;
            } else {
                __withStorage.storagePool = new StoragePool();
            }

            return {
                __withStorage,
                getStoragePool() {
                    return this.__withStorage.storagePool;
                },
                getStorageDriver() {
                    return this.__withStorage.driver;
                },
                isId(value) {
                    return this.getStorageDriver().isId(value);
                },
                async find(options: ?FindParams) {
                    if (!options) {
                        options = {};
                    }

                    const prepared = { ...options };

                    // Prepare find-specific options: perPage and page.
                    prepared.page = Number(prepared.page);
                    if (!Number.isInteger(prepared.page) || (prepared.page && prepared.page <= 1)) {
                        prepared.page = 1;
                    }

                    prepared.perPage = Number.isInteger(prepared.perPage) ? prepared.perPage : 10;

                    if (prepared.perPage && prepared.perPage > 0) {
                        const maxPerPage = this.__withStorage.maxPerPage || 100;
                        if (Number.isInteger(maxPerPage) && prepared.perPage > maxPerPage) {
                            throw new WithStorageError(
                                `Cannot query for more than ${maxPerPage} models per page.`,
                                WithStorageError.MAX_PER_PAGE_EXCEEDED
                            );
                        }
                    } else {
                        prepared.perPage = 10;
                    }

                    const [results, meta] = await this.getStorageDriver().find({
                        model: this,
                        options: prepared
                    });

                    const collection = new Collection()
                        .setParams(prepared)
                        .setMeta({ ...createPaginationMeta(), ...meta });

                    const result: ?Array<Object> = results;
                    if (result instanceof Array) {
                        for (let i = 0; i < result.length; i++) {
                            const pooled = this.getStoragePool().get(this, result[i].id);
                            if (pooled) {
                                collection.push(pooled);
                            } else {
                                const model = new this();
                                model.setExisting();
                                await model.populateFromStorage(result[i]);
                                this.getStoragePool().add(model);
                                collection.push(model);
                            }
                        }
                    }

                    return collection;
                },
                /**
                 * Finds a single model matched by given ID.
                 * @param id
                 * @param options
                 */
                async findById(id: mixed, options: ?Object): Promise<null | Entity> {
                    if (!id || !this.isId(id)) {
                        return null;
                    }

                    const pooled = this.getStoragePool().get(this, id);
                    if (pooled) {
                        return pooled;
                    }

                    if (!options) {
                        options = {};
                    }

                    const newParams = { ...options, query: { id } };
                    return await this.findOne(newParams);
                },

                /**
                 * Finds one model matched by given query parameters.
                 * @param options
                 */
                async findOne(options: ?Object): Promise<null | $Subtype<Entity>> {
                    if (!options) {
                        options = {};
                    }

                    const prepared = { ...options };

                    const result = await this.getStorageDriver().findOne({
                        model: this,
                        options: prepared
                    });

                    if (result) {
                        const pooled = this.getStoragePool().get(this, result.id);
                        if (pooled) {
                            return pooled;
                        }

                        const model: $Subtype<Entity> = new this();
                        model.setExisting();
                        await model.populateFromStorage(((result: any): Object));
                        this.getStoragePool().add(model);
                        return model;
                    }
                    return null;
                },

                /**
                 * Counts total number of models matched by given query parameters.
                 * @param options
                 */
                async count(options: ?Object): Promise<number> {
                    if (!options) {
                        options = {};
                    }

                    const prepared = { ...options };

                    return await this.getStorageDriver().count({
                        model: this,
                        options: prepared
                    });
                }
            };
        })(fn);

        return fn;
    };
};

export default withStorage;
