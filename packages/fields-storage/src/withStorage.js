// @flow
import { getName as defaultGetName } from "@commodo/name";
import getStorageName from "./getStorageName";
import { withStaticProps, withProps } from "repropose";
import cloneDeep from "lodash.clonedeep";
import { withHooks } from "@commodo/hooks";
import type { SaveParams } from "@commodo/fields-storage/types";
import WithStorageError from "./WithStorageError";
import Collection from "./Collection";
import StoragePool from "./StoragePool";
import FieldsStorageAdapter from "./FieldsStorageAdapter";
import { decodeCursor, encodeCursor } from "./cursor";
import idGenerator from "./idGenerator";
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

const generateId = () => idGenerator.generate();

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

const getName = (instance) => {
    return getStorageName(instance) || defaultGetName(instance);
};

type FindParams = Object & {
    query: ?{ [string]: number },
    sort: ?{ [string]: number },
    limit: ?number,
    before: ?string,
    after: ?string,
    totalCount: ?boolean,
    defaultSortField: ?string
};

function cursorFrom(data, keys) {
    return encodeCursor(
        keys.reduce(
            (acc, key) => {
                if (key === "id") {
                    return acc;
                }

                acc[key] = data[key];
                return acc;
            },
            { id: data.id }
        )
    );
}

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
            generateId,
            isId(value) {
                return typeof value === "string" && !!value.match(/^[a-zA-Z0-9]*$/);
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
                        if (!this.id) {
                            this.id = this.constructor.generateId();
                        }

                        if (existing) {
                            const { getId } = options;
                            await this.getStorageDriver().update([
                                {
                                    name: getName(this),
                                    query:
                                        typeof getId === "function" ? getId(this) : { id: this.id },
                                    data: await this.toStorage()
                                }
                            ]);
                        } else {
                            await this.getStorageDriver().create([
                                {
                                    name: getName(this),
                                    data: await this.toStorage()
                                }
                            ]);
                        }
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
                    if (!existing) {
                        this.getField("id").reset();
                    }
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

                let getId;

                ({ getId, ...options } = options);

                try {
                    await this.hook("delete", { options, model: this });

                    options.validation !== false && (await this.validate());

                    await this.hook("beforeDelete", { options, model: this });

                    await this.getStorageDriver().delete({
                        name: getName(this),
                        options: {
                            query: typeof getId === "function" ? getId(this) : { id: this.id },
                            ...options
                        }
                    });

                    await this.hook("afterDelete", { options, model: this });

                    this.constructor.getStoragePool().remove(this);
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

            async toStorage({ skipDifferenceCheck = false } = {}) {
                return this.__withStorage.fieldsStorageAdapter.toStorage({
                    fields: this.getFields(),
                    skipDifferenceCheck
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
                    return typeof value === "string" && !!value.match(/^[0-9a-fA-F]{24}$/);
                },
                generateId,
                async find(options: ?FindParams) {
                    if (!options) {
                        options = {};
                    }

                    const maxPerPage = this.__withStorage.maxPerPage || 100;

                    let {
                        query = {},
                        sort,
                        limit,
                        before,
                        after,
                        totalCount: countTotal = false,
                        defaultSortField = "id",
                        ...other
                    } = options;

                    if (!sort) {
                        sort = {};
                    }

                    limit = Number.isInteger(limit) && limit > 0 ? limit : maxPerPage;

                    if (limit > maxPerPage) {
                        throw new WithStorageError(
                            `Cannot query for more than ${maxPerPage} models per page.`,
                            WithStorageError.MAX_PER_PAGE_EXCEEDED
                        );
                    }

                    // Keep a backup of query for optional total count
                    const originalQuery = cloneDeep(query);

                    let forward = Boolean(after || !before);
                    const cursor = decodeCursor(after || before);

                    const op = forward ? "$lt" : "$gt";

                    if (cursor) {
                        if (!query.$and) {
                            query["$and"] = [];
                        }

                        const { id, ...fields } = cursor;
                        const sortFields = [Object.keys(fields).shift()].filter(Boolean);

                        if (sortFields.length) {
                            query["$and"].push({
                                $or: [
                                    // Build condition from cursor fields
                                    sortFields.reduce((acc, key) => {
                                        acc[key] = { [op]: fields[key] };
                                        return acc;
                                    }, {}),
                                    // Add condition to handle "exact match" records
                                    sortFields.reduce(
                                        (acc, key) => {
                                            acc[key] = fields[key];
                                            return acc;
                                        },
                                        { id: { [op]: id } }
                                    )
                                ]
                            });
                        } else {
                            query["$and"].push({ id: { [op]: id } });
                        }
                    }

                    if (!forward) {
                        Object.keys(sort).forEach(key => {
                            sort[key] *= -1;
                        });
                    }

                    if (sort && !sort[defaultSortField]) {
                        sort[defaultSortField] = forward ? -1 : 1;
                    }

                    const params = { query, sort, limit: limit + 1, ...other };
                    let [results, meta] = await this.getStorageDriver().find({
                        name: getName(this),
                        options: params
                    });

                    // Have we reached the last record?
                    const hasMore = results.length > limit;

                    if (hasMore) {
                        results.pop();
                    }

                    const hasNextPage = !!before || hasMore;
                    const hasPreviousPage = !!after || !!(before && hasMore);

                    let totalCount = null;
                    if (countTotal) {
                        totalCount = await this.getStorageDriver().count({
                            name: getName(this),
                            options: {
                                query: originalQuery,
                                ...other
                            }
                        });
                    }

                    const lastIndex = results.length - 1;
                    const nextCursor = hasNextPage
                        ? cursorFrom(forward ? results[lastIndex] : results[0], Object.keys(sort))
                        : null;

                    const previousCursor = hasPreviousPage
                        ? cursorFrom(forward ? results[0] : results[lastIndex], Object.keys(sort))
                        : null;

                    if (!forward) {
                        results = results.reverse();
                    }

                    const collection = new Collection().setParams(params).setMeta({
                        ...meta,
                        cursors: {
                            next: nextCursor,
                            previous: previousCursor
                        },
                        hasPreviousPage,
                        hasNextPage,
                        totalCount
                    });

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
                        name: getName(this),
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
                        name: getName(this),
                        options: prepared
                    });
                }
            };
        })(fn);

        return fn;
    };
};

export default withStorage;
