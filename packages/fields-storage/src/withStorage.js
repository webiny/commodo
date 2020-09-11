// @flow
import { getName as defaultGetName } from "@commodo/name";
import getStorageName from "./getStorageName";
import getPrimaryKey from "./getPrimaryKey";
import getKeys from "./getKeys";
import { withStaticProps, withProps } from "repropose";
import { withHooks } from "@commodo/hooks";
import type { SaveParams } from "@commodo/fields-storage/types";
import WithStorageError from "./WithStorageError";
import Collection from "./Collection";
import StoragePool from "./StoragePool";
import FieldsStorageAdapter from "./FieldsStorageAdapter";

// TODO: check faster alternative.
import cloneDeep from "lodash.clonedeep";

interface IStorageDriver {}

type Configuration = {
    storagePool?: StoragePool,
    driver?: IStorageDriver,
    maxLimit: ?number
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

const triggerSaveUpdateCreateHooks = async (prefix, { existing, model, options }) => {
    await hook(prefix + "Save", { model, options });
    if (existing) {
        await hook(prefix + "Update", { model, options });
    } else {
        await hook(prefix + "Create", { model, options });
    }
};

const getName = instance => {
    return getStorageName(instance) || defaultGetName(instance);
};

const withStorage = (configuration: Configuration) => {
    return baseFn => {
        let fn = withProps(props => ({
            __withStorage: {
                existing: false,
                processing: false,
                fieldsStorageAdapter: new FieldsStorageAdapter()
            },
            isExisting() {
                return this.__withStorage.existing;
            },
            setExisting(existing: boolean = true) {
                this.__withStorage.existing = existing;
                return this;
            },
            async save(rawArgs: ?SaveParams): Promise<void> {
                const primaryKey = getPrimaryKey(this);
                if (!primaryKey) {
                    throw Error(
                        `Cannot save "${this.getStorageName()}" model, no primary key defined.`
                    );
                }

                if (this.__withStorage.processing) {
                    return;
                }

                this.__withStorage.processing = "save";

                const existing = this.isExisting();

                const args = { ...defaults.save, ...cloneDeep(rawArgs) };

                await triggerSaveUpdateCreateHooks("before", {
                    existing,
                    model: this,
                    options: args
                });

                try {
                    await hook("__save", { model: this, options: args });
                    if (existing) {
                        await hook("__update", { model: this, options: args });
                    } else {
                        await hook("__create", { model: this, options: args });
                    }

                    args.validation !== false && (await this.validate());

                    await triggerSaveUpdateCreateHooks("__before", {
                        existing,
                        model: this,
                        options: args
                    });

                    if (this.isDirty()) {
                        const data = await this.toStorage();

                        if (existing) {
                            const query = {};
                            for (let i = 0; i < primaryKey.fields.length; i++) {
                                let field = primaryKey.fields[i];
                                query[field.name] = this[field.name];
                            }

                            await this.constructor.update({
                                batch: args.batch,
                                instance: this,
                                data,
                                query
                            });
                        } else {
                            await this.constructor.create({
                                batch: args.batch,
                                instance: this,
                                data
                            });
                        }
                    }

                    await triggerSaveUpdateCreateHooks("__after", {
                        existing,
                        model: this,
                        options: args
                    });

                    this.setExisting();
                    this.clean();

                    this.constructor.getStoragePool().add(this);
                } finally {
                    this.__withStorage.processing = null;
                }

                await triggerSaveUpdateCreateHooks("after", {
                    existing,
                    model: this,
                    options: args
                });
            },

            /**
             * Deletes current and all linked models (if autoDelete on the attribute was enabled).
             */
            async delete(rawArgs) {
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

                const args = { ...defaults.delete, ...cloneDeep(rawArgs) };

                try {
                    await this.hook("delete", { options: args, model: this });

                    args.validation !== false && (await this.validate());

                    await this.hook("beforeDelete", { options: args, model: this });

                    const query = {};
                    for (let i = 0; i < primaryKey.fields.length; i++) {
                        let field = primaryKey.fields[i];
                        query[field.name] = this[field.name];
                    }

                    await this.constructor.delete({
                        batch: args.batch,
                        instance: this,
                        query
                    });

                    await this.hook("afterDelete", { options: args, model: this });

                    this.constructor.getStoragePool().remove(this);
                } finally {
                    props.__withStorage.processing = null;
                }
            },

            getStorageDriver() {
                return this.constructor.__withStorage.driver;
            },

            getStorageName() {
                return getName(this);
            },

            async populateFromStorage(data: Object) {
                await this.__withStorage.fieldsStorageAdapter.fromStorage({
                    data,
                    fields: this.getFields()
                });
                return this;
            },

            async toStorage({ skipDifferenceCheck = false } = {}) {
                return this.__withStorage.fieldsStorageAdapter.toStorage({
                    fields: this.getFields(),
                    skipDifferenceCheck
                });
            }
        }))(baseFn);

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
                getStorageName() {
                    return getName(this);
                },

                /**
                 * Inserts an entry into the database.
                 */
                async create(args) {
                    const { data, batch, ...rest } = cloneDeep(args);

                    return this.getStorageDriver().create({
                        ...rest,
                        model: this,
                        name: getName(this),
                        keys: getKeys(this),
                        primaryKey: getPrimaryKey(this),
                        data,
                        batch
                    });
                },

                /**
                 * Updates an existing entry in the database.
                 */
                async update(args = {}) {
                    const { data, query, batch, ...rest } = cloneDeep(args);

                    return this.getStorageDriver().update({
                        ...rest,
                        model: this,
                        name: getName(this),
                        keys: getKeys(this),
                        primaryKey: getPrimaryKey(this),
                        data,
                        query,
                        batch
                    });
                },

                /**
                 * Deletes an existing entry in the database.
                 */
                async delete(args = {}) {
                    const { data, query, batch, ...rest } = cloneDeep(args);

                    return this.getStorageDriver().delete({
                        ...rest,
                        model: this,
                        name: getName(this),
                        keys: getKeys(this),
                        primaryKey: getPrimaryKey(this),
                        data,
                        query,
                        batch
                    });
                },

                /**
                 * Finds one model matched by given query parameters.
                 * @param rawArgs
                 */
                async findOne(rawArgs) {
                    const cached = this.getStoragePool().get(this, rawArgs.query);
                    if (cached) {
                        return cached;
                    }

                    if (!rawArgs) {
                        rawArgs = {};
                    }

                    const args = cloneDeep(rawArgs);
                    args.limit = 1;

                    const result = await this.find(args);
                    if (result) {
                        return result[0] || null;
                    }

                    return null;
                },

                async find(rawArgs = {}) {
                    const maxLimit = this.__withStorage.maxLimit;

                    let { batch, query = {}, sort = {}, limit, ...other } = rawArgs;

                    if (maxLimit && limit > maxLimit) {
                        throw new WithStorageError(
                            `Cannot set a limit greater than "${maxLimit}". Please adjust the "maxLimit" argument if needed.`,
                            WithStorageError.MAX_LIMIT_EXCEEDED
                        );
                    }

                    const params = { query, sort, limit, ...other };
                    let [results, meta = {}] = await this.getStorageDriver().find({
                        ...params,
                        model: this,
                        name: getName(this),
                        keys: getKeys(this),
                        primaryKey: getPrimaryKey(this),
                        query,
                        batch
                    });

                    const collection = new Collection().setParams(params).setMeta(meta);

                    const result: ?Array<Object> = results;
                    if (Array.isArray(result)) {
                        for (let i = 0; i < result.length; i++) {
                            if (!result[i]) {
                                continue;
                            }

                            const pooled = this.getStoragePool().get(this, result[i]);
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
                 * Counts total number of models matched by given query parameters.
                 * @param options
                 */
                async count(options: ?Object): Promise<number> {
                    if (!options) {
                        options = {};
                    }

                    const prepared = { ...options };

                    return await this.getStorageDriver().count({
                        name: getName(this),
                        options: prepared
                    });
                }
            };
        })(fn);

        withHooks()(fn);

        return fn;
    };
};

export default withStorage;
