// @flow
import { withStaticProps, withProps } from "repropose";
import { withHooks } from "@commodo/hooks";
import type { SaveParams } from "@commodo/fields-storage/types";
import WithStorageError from "./WithStorageError";
import createPaginationMeta from "./createPaginationMeta";
import Collection from "./Collection";
import StoragePool from "./StoragePool";
import FieldsStorageAdapter from "./FieldsStorageAdapter";

// TODO: remove this dependency!!!
import { compose } from "ramda";

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

const hook = async (name, { params, model }) => {
    if (params.hooks[name] === false) {
        return;
    }
    await model.hook(name, { model, params });
};

const registerSaveUpdateCreateHooks = async (prefix, { existing, model, params }) => {
    await hook(prefix + "Save", { model, params });
    if (existing) {
        await hook(prefix + "Update", { model, params });
    } else {
        await hook(prefix + "Create", { model, params });
    }
};

type FindParams = Object & {
    perPage: ?number,
    page: ?number
};

const withStorage = (configuration: Configuration) => {
    return compose(
        withHooks({
            delete() {
                if (!this.id) {
                    throw new WithStorageError(
                        "Entity cannot be deleted because it was not previously saved.",
                        WithStorageError.CANNOT_DELETE_NO_ID
                    );
                }
            }
        }),
        withProps(props => ({
            __storage: {
                existing: false,
                processing: false,
                fieldsStorageAdapter: new FieldsStorageAdapter()
            },
            isId(value) {
                return this.constructor.getStorageDriver().isId(value);
            },
            isExisting() {
                return this.__storage.existing;
            },
            setExisting(existing: boolean = true) {
                this.__storage.existing = existing;
                return this;
            },
            async save(params: ?SaveParams): Promise<void> {
                params = { ...params, ...defaults.save };

                if (this.__storage.processing) {
                    return;
                }

                this.__storage.processing = "save";

                const existing = this.isExisting();

                await registerSaveUpdateCreateHooks("before", { existing, model: this, params });

                try {
                    await hook("__save", { model: this, params });
                    if (existing) {
                        await hook("__update", { model: this, params });
                    } else {
                        await hook("__create", { model: this, params });
                    }

                    params.validation !== false && (await this.validate());

                    await registerSaveUpdateCreateHooks("__before", {
                        existing,
                        model: this,
                        params
                    });

                    if (this.isDirty()) {
                        const { configuration } = this.constructor.__storage;
                        await configuration.driver.save({
                            isUpdate: existing,
                            isCreate: !existing,
                            model: this
                        });
                    }

                    await registerSaveUpdateCreateHooks("__after", {
                        existing,
                        model: this,
                        params
                    });

                    this.setExisting();
                    this.clean();

                    this.constructor.getStoragePool().add(this);
                } catch (e) {
                    throw e;
                } finally {
                    this.__storage.processing = null;
                }

                await registerSaveUpdateCreateHooks("after", { existing, model: this, params });
            },
            /**
             * Deletes current and all linked models (if autoDelete on the attribute was enabled).
             * @param params
             */
            async delete(params: ?Object) {
                if (this.__storage.processing) {
                    return;
                }

                this.__storage.processing = "delete";

                params = { ...params, ...defaults.delete };

                try {
                    await this.hook("delete", { params, model: this });

                    params.validation !== false && (await this.validate());

                    await this.hook("beforeDelete", { params, model: this });

                    await this.getStorageDriver().delete({ model: this, params });
                    await this.hook("afterDelete", { params, model: this });

                    this.constructor.getStoragePool().remove(this);
                } catch (e) {
                    throw e;
                } finally {
                    props.__storage.processing = null;
                }
            },

            getStorageDriver() {
                return this.constructor.__storage.configuration.driver;
            },

            async populateFromStorage(data: Object) {
                await this.__storage.fieldsStorageAdapter.fromStorage({
                    data,
                    fields: this.getFields()
                });
                return this;
            },

            async toStorage() {
                return this.__storage.fieldsStorageAdapter.toStorage({ fields: this.getFields() });
            }
        })),
        withStaticProps({
            __withStorage: true, // For satisfying hasStorage helper function. TODO: remove this one
            __storage: {
                configuration: { ...configuration },
                storagePool:
                    typeof configuration.storagePool === "function"
                        ? new configuration.storagePool()
                        : new StoragePool()
            },
            getStoragePool() {
                return this.__storage.storagePool;
            },
            getStorageDriver() {
                return this.__storage.configuration.driver;
            },
            isId(value) {
                return this.getStorageDriver().isId(value);
            },
            async find(options: ?FindParams) {
                if (!options) {
                    options = {};
                }

                const prepared = { ...options };

                // Prepare find-specific params: perPage and page.
                prepared.page = Number(prepared.page);
                if (!Number.isInteger(prepared.page) || (prepared.page && prepared.page <= 1)) {
                    prepared.page = 1;
                }

                prepared.perPage = Number.isInteger(prepared.perPage) ? prepared.perPage : 10;

                if (prepared.perPage && prepared.perPage > 0) {
                    const maxPerPage = this.__storage.configuration.maxPerPage || 100;
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
                    .setMeta({ ...createPaginationMeta(), meta });

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
             * @param params
             */
            async findById(id: mixed, params: ?Object): Promise<null | Entity> {
                if (!id || !this.isId(id)) {
                    return null;
                }

                const pooled = this.getStoragePool().get(this, id);
                if (pooled) {
                    return pooled;
                }

                if (!params) {
                    params = {};
                }

                const newParams = { ...params, query: { id } };
                return await this.findOne(newParams);
            },

            /**
             * Finds one or more models matched by given IDs.
             * @param ids
             * @param params
             */
            async findByIds(ids: Array<mixed>, params: ?Object): Promise<Array<Entity>> {
                const output = [];
                for (let i = 0; i < ids.length; i++) {
                    const model = await this.findById(ids[i], params);
                    if (model) {
                        output.push(model);
                    }
                }

                return output;
            },

            /**
             * Finds one model matched by given query parameters.
             * @param params
             */
            async findOne(params: ?Object): Promise<null | $Subtype<Entity>> {
                if (!params) {
                    params = {};
                }

                const prepared = { ...params };

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
             * @param params
             */
            async count(params: ?Object): Promise<number> {
                if (!params) {
                    params = {};
                }

                const prepared = { ...params };

                return await this.getStorageDriver().count({
                    model: this,
                    options: prepared
                });
            }
        })
    );
};

export default withStorage;
