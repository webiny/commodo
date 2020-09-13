import { getName as defaultGetName } from "@commodo/name";
import getStorageName from "./getStorageName";
import getPrimaryKey from "./getPrimaryKey";
import getKeys from "./getKeys";
import { withStaticProps, withProps } from "repropose";
import { withHooks } from "@commodo/hooks";
import WithStorageError from "./WithStorageError";
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

const hook = async (name, { args, model }) => {
    if (args.hooks[name] === false) {
        return;
    }
    await model.hook(name, { model, args });
};

const triggerSaveUpdateCreateHooks = async (prefix, { existing, model, args }) => {
    await hook(prefix + "Save", { model, args });
    if (existing) {
        await hook(prefix + "Update", { model, args });
    } else {
        await hook(prefix + "Create", { model, args });
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
            async save(rawArgs = {}): Promise<void> {
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
                    args
                });

                let result = [];

                try {
                    await hook("__save", { model: this, args });
                    if (existing) {
                        await hook("__update", { model: this, args });
                    } else {
                        await hook("__create", { model: this, args });
                    }

                    args.validation !== false && (await this.validate());

                    await triggerSaveUpdateCreateHooks("__before", {
                        existing,
                        model: this,
                        args
                    });

                    if (this.isDirty()) {
                        const data = await this.toStorage();

                        if (existing) {
                            const query = {};
                            for (let i = 0; i < primaryKey.fields.length; i++) {
                                let field = primaryKey.fields[i];
                                query[field.name] = this[field.name];
                            }

                            result = await this.constructor.update({
                                ...args,
                                instance: this,
                                data,
                                query
                            });
                        } else {
                            result = await this.constructor.create({
                                ...args,
                                instance: this,
                                data
                            });
                        }
                    }

                    await triggerSaveUpdateCreateHooks("__after", {
                        existing,
                        model: this,
                        args
                    });

                    this.setExisting();
                    this.clean();

                    this.constructor.getStoragePool().add(this);

                    await triggerSaveUpdateCreateHooks("after", {
                        existing,
                        model: this,
                        args
                    });

                    if (args.meta) {
                        return result;
                    }

                    return result[0];
                } finally {
                    this.__withStorage.processing = null;
                }
            },
            async delete(rawArgs = {}) {
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

                const args = cloneDeep(rawArgs);

                try {
                    await this.hook("delete", { args, model: this });

                    args.validation !== false && (await this.validate());

                    await this.hook("beforeDelete", { args, model: this });

                    const query = {};
                    for (let i = 0; i < primaryKey.fields.length; i++) {
                        let field = primaryKey.fields[i];
                        query[field.name] = this[field.name];
                    }

                    const result = await this.constructor.delete({
                        ...args,
                        instance: this,
                        query
                    });

                    await this.hook("afterDelete", { args, model: this });

                    this.constructor.getStoragePool().remove(this);

                    if (args.meta) {
                        return result;
                    }

                    return result[0];
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
                async query(crudOperation, rawArgs) {
                    const args = cloneDeep(rawArgs);
                    const result = await this.getStorageDriver()[crudOperation]({
                        ...args,
                        model: this,
                        name: getName(this),
                        keys: getKeys(this),
                        primaryKey: getPrimaryKey(this)
                    });

                    if (args.meta) {
                        return result;
                    }

                    return result[0];
                },

                async create(args = {}) {
                    return this.query("create", args);
                },
                async read(args = {}) {
                    return this.query("read", args);
                },
                async update(args = {}) {
                    return this.query("update", args);
                },
                async delete(args = {}) {
                    return this.query("delete", args);
                },

                async find(rawArgs = {}) {
                    const maxLimit = this.__withStorage.maxLimit;
                    const args = cloneDeep(rawArgs);

                    if (maxLimit && args.limit > maxLimit) {
                        throw new WithStorageError(
                            `Cannot set a limit greater than "${maxLimit}". Please adjust the "maxLimit" argument if needed.`,
                            WithStorageError.MAX_LIMIT_EXCEEDED
                        );
                    }

                    let results = await this.read({
                        ...args,
                        model: this,
                        name: getName(this),
                        keys: getKeys(this),
                        primaryKey: getPrimaryKey(this)
                    });

                    const storageItems = args.meta ? results[0] : results;
                    const returnItems = [];
                    if (Array.isArray(storageItems)) {
                        for (let i = 0; i < storageItems.length; i++) {
                            if (!storageItems[i]) {
                                continue;
                            }

                            const pooled = this.getStoragePool().get(this, storageItems[i]);
                            if (pooled) {
                                returnItems.push(pooled);
                            } else {
                                const model = new this();
                                model.setExisting();
                                await model.populateFromStorage(storageItems[i]);
                                this.getStoragePool().add(model);
                                returnItems.push(model);
                            }
                        }
                    }

                    if (args.meta) {
                        return [returnItems, results[1]];
                    }

                    return returnItems;
                },

                /**
                 * Finds one model matched by given query parameters.
                 * @param rawArgs
                 */
                async findOne(rawArgs = {}) {
                    const args = cloneDeep(rawArgs);
                    args.limit = 1;

                    const meta = { returnedFromStoragePool: true };

                    const cached = this.getStoragePool().get(this, args.query);
                    if (cached) {
                        if (args.meta) {
                            return [cached, meta];
                        }
                        return cached;
                    }

                    meta.returnedFromStoragePool = false;

                    if (args.meta) {
                        const [result, meta] = await this.find(args);
                        return [result[0] || null, meta];
                    }

                    const result = await this.find(args);
                    return result[0] || null;
                }
            };
        })(fn);

        withHooks()(fn);

        return fn;
    };
};

export default withStorage;
