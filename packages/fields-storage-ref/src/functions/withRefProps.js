// @flow
import { getName } from "@commodo/name";
import { withProps } from "repropose";
import { Collection } from "@commodo/fields-storage";
import { hasFields, WithFieldsError } from "@commodo/fields";
import { firstCharacterToLower, getIdFromValue, instanceOf as isInstanceOf, checkParent } from ".";

export default ({ list, instanceOf, using, autoDelete, autoSave, refNameField, parent }) => {
    return withProps(props => {
        const { setValue, isDirty, validate, clean } = props;

        return {
            list,
            using,
            options: {
                refNameField
            },
            queue: [],
            // Contains initial value received upon loading from storage. If the current value becomes different from initial,
            // upon save, old entity must be removed. This is only active when auto delete option on the field is enabled,
            // which then represents a one to one relationship.
            initial: null,
            classes: null,
            auto: null,
            init() {
                if (parent) {
                    this.parent = parent;
                }

                checkParent(this);

                if (list) {
                    this.current = new Collection();
                    this.initial = new Collection();

                    this.links = {
                        dirty: false,
                        set: false,
                        current: new Collection(),
                        initial: new Collection()
                    };

                    this.classes = {
                        parent: getName(this.parent),
                        models: { class: null, field: null },
                        using: { class: null, field: null }
                    };

                    if (Array.isArray(instanceOf)) {
                        if (typeof instanceOf[1] === "string") {
                            this.classes.models.class = instanceOf[0];
                            this.classes.models.field = instanceOf[1];
                        } else {
                            this.classes.models.class = instanceOf;
                        }
                    } else {
                        this.classes.models.class = instanceOf;
                    }

                    // We will use the same value here to (when loading models without a middle aggregation model).
                    if (!this.classes.models.field) {
                        this.classes.models.field = firstCharacterToLower(this.classes.parent);
                    }

                    if (using) {
                        if (Array.isArray(using)) {
                            this.setUsing(...using);
                        } else {
                            this.setUsing(using);
                        }
                    }

                    /**
                     * Auto save and delete are both enabled by default.
                     * @type {{save: boolean, delete: boolean}}
                     */
                    this.auto = {
                        save: typeof autoSave === "undefined" ? true : autoSave,
                        delete: typeof autoDelete === "undefined" ? true : autoDelete
                    };

                    /**
                     * By default, we don't want to have links stored in model field directly.
                     * @var bool
                     */
                    this.toStorage = false;

                    this.parent.hook("__save", async () => {
                        // If loading is in progress, wait until loaded.
                        const mustManage = this.isDirty() || this.state.loading;
                        if (!mustManage) {
                            return;
                        }

                        await this.load();
                        await this.normalizeSetValues();

                        if (this.getUsingClass()) {
                            // Do we have to manage models?
                            // If so, this will ensure that newly set or unset models and its link models are synced.
                            // "syncCurrentEntitiesAndLinks" method must be called on this event because link models must be ready
                            // before the validation of data happens. When validation happens and when link class is set,
                            // validation is triggered on link (aggregation) model, not on model end (linked) model.
                            await this.manageCurrentLinks();
                        } else {
                            await this.manageCurrent();
                        }
                    });

                    /**
                     * Same as in non-list ref field, models present here were already validated when parent model called the validate method.
                     * At this point, models are ready to be saved (only loaded models).
                     */
                    this.parent.hook("__afterSave", async () => {
                        // We don't have to do the following check here:
                        // this.value.isLoading() && (await this.value.load());

                        // ...it was already made in the 'save' handler above. Now we only check if not loaded.
                        if (!this.state.loaded || !this.isDirty()) {
                            return;
                        }

                        if (this.getAutoSave()) {
                            // If we are using a link class, we only need to save links, and child models will be automatically
                            // saved if they were loaded.
                            if (this.getUsingClass()) {
                                const models = this.links.current;
                                for (let i = 0; i < models.length; i++) {
                                    const current = models[i];
                                    await current.save({ validation: false });
                                }
                            } else {
                                const models = this.current;
                                for (let i = 0; i < models.length; i++) {
                                    const current = models[i];
                                    await current.save({ validation: false });
                                }
                            }

                            if (this.getAutoDelete()) {
                                this.getUsingClass()
                                    ? await this.deleteInitialLinks()
                                    : await this.deleteInitial();
                            }
                        }

                        // Set current models as new initial values.
                        this.syncInitial();
                        if (this.getUsingClass()) {
                            this.syncInitialLinks();
                        }
                    });

                    this.parent.hook("delete", async () => {
                        if (this.getAutoDelete()) {
                            await this.load();
                            const models = {
                                current: this.getUsingClass() ? this.links.current : this.current,
                                class: this.getUsingClass() || this.getEntitiesClass()
                            };
                            for (let i = 0; i < models.current.length; i++) {
                                if (isInstanceOf(models.current[i], models.class)) {
                                    await models.current[i].hook("delete");
                                }
                            }
                        }
                    });

                    this.parent.hook("beforeDelete", async () => {
                        if (this.getAutoDelete()) {
                            await this.load();
                            const models = {
                                current: this.getUsingClass() ? this.links.current : this.current,
                                class: this.getUsingClass() || this.getEntitiesClass()
                            };

                            for (let i = 0; i < models.current.length; i++) {
                                if (isInstanceOf(models.current[i], models.class)) {
                                    await models.current[i].delete({
                                        events: { delete: false }
                                    });
                                }
                            }
                        }
                    });
                } else {
                    /**
                     * Auto save is always enabled, but delete not. This is because users will more often create many to one relationship than
                     * one to one. If user wants a strict one to one relationship, then delete flag must be set to true. In other words, it would
                     * be correct to say that if auto delete is enabled, we are dealing with one to one relationship.
                     * @type {{save: boolean, delete: boolean}}
                     */

                    this.auto = {
                        save: typeof autoSave === "undefined" ? true : autoSave,
                        delete: typeof autoDelete === "undefined" ? false : autoDelete
                    };

                    this.classes = {
                        model: { class: instanceOf }
                    };

                    /**
                     * Before save, let's validate and save linked model.
                     *
                     * This ensures that parent model has a valid ID which can be stored and also that all nested data is valid since
                     * validation will be called internally in the save method. Save operations will be executed starting from bottom
                     * nested models, ending with the main parent model.
                     */
                    this.parent.hook("__beforeSave", async () => {
                        // At this point current value is an instance or is not instance. It cannot be in the 'loading' state, because that was
                        // already checked in the validate method - if in that step model was in 'loading' state, it will be waited before proceeding.
                        if (this.getAutoSave()) {
                            // We don't need to validate here because validate method was called on the parent model, which caused
                            // the validation of data to be executed recursively on all field values.
                            if (hasFields(this.current)) {
                                await this.current.save({ validation: false });
                            }

                            // If initially we had a different model linked, we must delete it.
                            // If initial is empty, that means nothing was ever loaded (field was not accessed) and there is nothing to do.
                            // Otherwise, deleteInitial method will internally delete only models that are not needed anymore.
                            if (this.getAutoDelete()) {
                                await this.deleteInitial(this.auto.delete.options);
                            }
                        }

                        // Set current models as new initial values.
                        this.syncInitial();
                    });

                    /**
                     * Once parent model starts the delete process, we must also make the same on all linked models.
                     * The deletes are done on initial storage models, not on models stored as current value.
                     */
                    this.parent.hook("delete", async () => {
                        if (this.getAutoDelete()) {
                            await this.load();
                            const model = this.initial;
                            if (isInstanceOf(model, instanceOf)) {
                                await model.hook("delete");
                            }
                        }
                    });

                    this.parent.hook("beforeDelete", async () => {
                        if (this.getAutoDelete()) {
                            await this.load();
                            const model = this.initial;
                            if (isInstanceOf(model, instanceOf)) {
                                // We don't want to fire the "delete" event because its handlers were already executed by upper 'delete' listener.
                                // That listener ensured that all callbacks that might've had blocked the deleted process were executed.
                                await model.delete({
                                    validation: false,
                                    hooks: { delete: false }
                                });
                            }
                        }
                    });
                }
            },

            /**
             * Should linked model be automatically saved once parent model is saved? By default, linked models will be automatically saved,
             * after main model was saved. Can be disabled, although not recommended since manual saving needs to be done in that case.
             * @param enabled
             * @param options
             */
            setAutoSave(enabled: boolean = true) {
                this.auto.save = enabled;
                return this;
            },

            /**
             * Returns true if auto save is enabled, otherwise false.
             * @returns {boolean}
             */
            getAutoSave(): boolean {
                return this.auto.save;
            },

            /**
             * Should linked model be automatically deleted once parent model is deleted? By default, linked models will be automatically
             * deleted, before main model was deleted. Can be disabled, although not recommended since manual deletion needs to be done in that case.
             * @param enabled
             */
            setAutoDelete(enabled: boolean = true) {
                this.auto.delete = enabled;
                return this;
            },

            /**
             * Returns true if auto delete is enabled, otherwise false.
             * @returns {boolean}
             */
            getAutoDelete(): boolean {
                return this.auto.delete;
            },

            getEntityClass(): ?Function {
                if (this.list) {
                    return this.classes.models.class;
                }

                if (Array.isArray(this.classes.model.class)) {
                    let refNameField = this.parent.getField(this.options.refNameField);
                    if (refNameField) {
                        const classId = refNameField.getValue();
                        for (let i = 0; i < this.classes.model.class.length; i++) {
                            let current = this.classes.model.class[i];
                            if (current.classId === classId) {
                                return current;
                            }
                        }
                    }

                    return undefined;
                }

                return this.classes.model.class;
            },

            getEntityClasses() {
                return this.classes.model.class;
            },

            getRefNameField() {
                return this.parent.getField(this.options.refNameField);
            },

            hasMultipleEntityClasses(): boolean {
                return Array.isArray(this.classes.model.class);
            },

            canAcceptAnyEntityClass(): boolean {
                return this.hasMultipleEntityClasses() && this.classes.model.class.length === 0;
            },

            setEntityClass(model: Function) {
                this.classes.model.class = model;
                return this;
            },

            setValue(value, options = { skipDifferenceCheck: true, forceSetAsDirty: true }) {
                if (this.list) {
                    return setValue.call(this, value, options);
                }

                setValue.call(this, value);

                // If we are dealing with multiple Entity classes, we must assign received classId into
                // field specified by the "refNameField" option (passed on field construction).
                const refNameField = this.getRefNameField();
                if (refNameField && this.hasMultipleEntityClasses()) {
                    if (hasFields(value)) {
                        return refNameField.setValue(getName(value));
                    }
                    if (!value) {
                        return refNameField.setValue(null);
                    }
                }
            },

            /**
             * Loads current model if needed and returns it.
             * @returns {Promise<void>}
             */
            async getValue(): Promise<mixed> {
                if (!this.isDirty()) {
                    await this.load();
                }

                if (list) {
                    await this.normalizeSetValues();
                    return this.current;
                }

                // "Instance of Entity" check is enough at this point.
                if (hasFields(this.current)) {
                    return this.current;
                }

                const modelClass = this.getEntityClass();
                if (!modelClass) {
                    return this.current;
                }

                const id = getIdFromValue(this.current);

                if (this.parent.isId(id)) {
                    const model = await modelClass.findById(id);
                    if (model) {
                        // If we initially had object with other data set, we must populate model with it, otherwise
                        // just set loaded model (because only an ID was received, without additional data).
                        const current = this.current;
                        if (current instanceof Object) {
                            model.populate(current);
                        }

                        this.state.set = true;
                        this.current = model;
                    }
                    return this.current;
                }

                const current = this.current;
                if (current instanceof Object) {
                    const model = new modelClass().populate(current);
                    this.state.set = true;
                    this.current = model;
                }

                // If valid value was not returned until this point, we return recently set value.
                // The reason is, if the model is about to be saved, validation must be executed and error must be thrown,
                // warning users that passed value is invalid / model was not found.
                return this.current;
            },

            /**
             * Returns storage value (model ID or null).
             * @returns {Promise<*>}
             */
            async getStorageValue() {
                // Not using getValue method because it would load the model without need.
                let current = this.current;

                // But still, if the value is loading currently, let's wait for it to load completely, and then use that value.
                if (this.state.loading) {
                    current = await this.load();
                }

                const id = getIdFromValue(current);
                return this.parent.isId(id) ? id : null;
            },

            /**
             * Sets value received from storage.
             * @param value
             * @returns {EntityField}
             */
            setStorageValue(value: mixed) {
                if (list) {
                    return;
                }

                this.current = value;
                this.initial = value;
                this.state.set = true;

                return this;
            },

            async refsValidateValue(value: mixed) {
                const errors = [];
                const correctClass = this.getUsingClass() || this.getEntitiesClass();

                if (!Array.isArray(value)) {
                    return;
                }

                for (let i = 0; i < value.length; i++) {
                    const currentEntity = value[i];
                    if (!isInstanceOf(currentEntity, correctClass)) {
                        errors.push({
                            code: WithFieldsError.VALIDATION_FAILED_INVALID_FIELD,
                            data: {
                                index: i
                            },
                            message: `Validation failed, item at index ${i} not an instance of correct Entity class.`
                        });
                        continue;
                    }

                    try {
                        await currentEntity.validate();
                    } catch (e) {
                        errors.push({
                            code: e.code,
                            data: { index: i, ...e.data },
                            message: e.message
                        });
                    }
                }

                if (errors.length > 0) {
                    throw new WithFieldsError(
                        "Validation failed.",
                        WithFieldsError.VALIDATION_FAILED_INVALID_FIELD,
                        errors
                    );
                }
            },

            /**
             * Validates on attribute level and then on model level (its attributes recursively).
             * If attribute has validators, we must unfortunately always load the attribute value. For example, if we had a 'required'
             * validator, and model not loaded, we cannot know if there is a value or not, and thus if the validator should fail.
             * @returns {Promise<void>}
             */
            async refsValidate() {
                // If attribute has validators or loading is in progress, wait until loaded.
                const mustValidate = this.isDirty() || this.validation || this.state.loading;
                if (!mustValidate) {
                    return;
                }

                await this.load();

                await this.normalizeSetValues();
                const value = this.getUsingClass() ? this.links.current : this.current;

                const notEmpty = !this.isEmpty();

                await validate.call(this);
                notEmpty && (await this.refsValidateValue(value));
            },

            /**
             * Validates on field level and then on model level (its fields recursively).
             * If field has validators, we must unfortunately always load the field value. For example, if we had a 'required'
             * validator, and model not loaded, we cannot know if there is a value or not, and thus if the validator should fail.
             * @returns {Promise<void>}
             */
            async validate() {
                if (this.list) {
                    return this.refsValidate();
                }

                // If field is dirty, has validators or loading is in progress, wait until loaded.
                if (this.isDirty() || this.validation || this.state.loading) {
                    await this.load();
                }

                if (!this.state.loaded) {
                    return;
                }

                const value = await this.getValue();
                const notEmpty = !this.isEmpty();

                if (notEmpty && this.hasMultipleEntityClasses()) {
                    if (!this.options.refNameField) {
                        throw new WithFieldsError(
                            `Entity field "${this.name}" accepts multiple Entity classes but does not have "refNameField" option defined.`,
                            WithFieldsError.VALIDATION_FAILED_INVALID_FIELD
                        );
                    }

                    let refNameField = this.getRefNameField();
                    if (!refNameField) {
                        throw new WithFieldsError(
                            `Entity field "${this.name}" accepts multiple Entity classes but classId field is missing.`,
                            WithFieldsError.VALIDATION_FAILED_INVALID_FIELD
                        );
                    }

                    // We only do class validation if list of classes has been provided. Otherwise, we don't do the check.
                    // This is because in certain cases, a list of classes cannot be defined, and in other words, any
                    // class of model can be assigned. One example is the File model, which has an "ref" field, which
                    // can actually link to any type of model.
                    if (!this.canAcceptAnyEntityClass()) {
                        if (!this.getEntityClass()) {
                            const heldValue = await refNameField.getValue();
                            if (!(typeof heldValue === "string")) {
                                throw new WithFieldsError(
                                    `Entity field "${this.name}" accepts multiple Entity classes but it was not found (classId field holds invalid non-string value).`,
                                    WithFieldsError.VALIDATION_FAILED_INVALID_FIELD
                                );
                            }

                            throw new WithFieldsError(
                                `Entity field "${this.name}" accepts multiple Entity classes but it was not found (classId field holds value "${heldValue}").`,
                                WithFieldsError.VALIDATION_FAILED_INVALID_FIELD
                            );
                        }
                    }
                }

                if (notEmpty && !this.isValidInstance(value)) {
                    throw new WithFieldsError(
                        `Validation failed, received ${typeof value}, expecting instance a valid reference.`,
                        WithFieldsError.VALIDATION_FAILED_INVALID_FIELD
                    );
                }

                await validate.call(this);
                notEmpty && (await value.validate());
            },

            isValidInstance(instance: ?Entity) {
                if (this.hasMultipleEntityClasses()) {
                    return hasFields(instance);
                }

                return isInstanceOf(instance, instanceOf);
            },

            async load() {
                if (this.list) {
                    return this.loadRefs();
                }
                return this.loadRef();
            },

            async loadRefs() {
                if (this.state.loading) {
                    return new Promise(resolve => this.queue.push(resolve));
                }

                if (this.state.loaded) {
                    return;
                }

                const classes = this.classes;

                this.state.loading = true;

                if (this.parent.isExisting()) {
                    let id = await this.parent.getField("id").getValue();

                    if (classes.using.class) {
                        this.links.initial = await classes.using.class.find({
                            query: { [classes.models.field]: id }
                        });

                        this.initial = new Collection();
                        for (let i = 0; i < this.links.initial.length; i++) {
                            this.initial.push(await this.links.initial[i][classes.using.field]);
                        }
                    } else {
                        this.initial = await classes.models.class.find({
                            query: { [classes.models.field]: id }
                        });
                    }

                    if (!this.isDirty()) {
                        const initial = this.initial;
                        const initialLinks = this.links.initial;
                        if (Array.isArray(initial) && Array.isArray(initialLinks)) {
                            this.state.set = true;
                            this.current = new Collection(initial);
                            if (classes.using.class) {
                                this.links.set = true;
                                this.links.current = new Collection(initialLinks);
                            }
                        }
                    }
                }

                this.state.loading = false;
                this.state.loaded = true;

                await this.__executeQueue();

                return this.current;
            },

            /**
             * Ensures data is loaded correctly, and in the end returns current value.
             * @returns {Promise<*>}
             */
            async loadRef() {
                if (this.state.loading) {
                    return new Promise(resolve => {
                        this.queue.push(resolve);
                    });
                }

                if (this.state.loaded) {
                    return;
                }

                this.state.loading = true;

                // Only if we have a valid ID set, we must load linked entity.
                const initial = this.initial;
                if (this.parent.isId(initial)) {
                    const modelClass = this.getEntityClass();
                    if (modelClass) {
                        const entity = await modelClass.findById(initial);
                        this.initial = entity;
                        // If current value is not dirty, than we can set initial value as current, otherwise we
                        // assume that something else was set as current value like a new entity.
                        if (!this.isDirty()) {
                            this.state.set = true;
                            this.current = entity;
                        }
                    }
                }

                this.state.loading = false;
                this.state.loaded = true;

                await this.__executeQueue();

                return this.current;
            },

            async deleteInitial(options: ?{}) {
                if (!this.hasInitial()) {
                    return;
                }

                if (this.list) {
                    const initial = this.initial,
                        currentEntitiesIds = this.current.map(model => getIdFromValue(model));

                    for (let i = 0; i < initial.length; i++) {
                        const currentInitial: mixed = initial[i];
                        if (hasFields(currentInitial)) {
                            if (!currentEntitiesIds.includes(currentInitial.id)) {
                                await currentInitial.delete();
                            }
                        }
                    }
                    return;
                }

                // Initial value will always be an existing (already saved) Entity instance.
                const initial = this.initial;
                if (
                    hasFields(initial) &&
                    getIdFromValue(initial) !== getIdFromValue(this.current)
                ) {
                    await initial.delete(options);
                }
            },

            syncInitial() {
                if (this.list) {
                    this.initial = new Collection([...this.current]);

                    return;
                }
                this.initial = this.current;
            },

            hasInitial() {
                if (this.list) {
                    return this.initial.length > 0;
                }
                return isInstanceOf(this.initial, this.getEntityClass());
            },

            isDirty(): boolean {
                if (this.list) {
                    if (isDirty.bind(this)()) {
                        return true;
                    }
                    if (Array.isArray(this.current)) {
                        for (let i = 0; i < this.current.length; i++) {
                            if (hasFields(this.current[i]) && this.current[i].isDirty()) {
                                return true;
                            }
                        }
                    }
                    return false;
                }

                if (isDirty.bind(this)()) {
                    return true;
                }
                return hasFields(this.current) && this.current.isDirty();
            },

            async manageCurrent() {
                const current = this.current;

                for (let i = 0; i < current.length; i++) {
                    const model = current[i];
                    if (hasFields(model)) {
                        const classes = this.classes;
                        model[classes.models.field] = this.parent;
                    }
                }
            },

            /**
             * Value cannot be set as clean if there is no ID present.
             */
            clean(): EntityFieldValue {
                if (getIdFromValue(this.current)) {
                    clean.call(this);
                }

                return this;
            },

            isDifferentFrom(value: mixed): boolean {
                const currentId = getIdFromValue(this.current);

                if (hasFields(value)) {
                    return !value.id || value.id !== currentId;
                }

                if (value instanceof Object) {
                    if (!value.id) {
                        return true;
                    }
                    return value.id !== currentId || Object.keys(value).length > 1;
                }

                return currentId !== value;
            },

            async __executeQueue() {
                if (this.queue.length) {
                    for (let i = 0; i < this.queue.length; i++) {
                        await this.queue[i]();
                    }
                    this.queue = [];
                }
            },
            // tu krece entities

            async normalizeSetValues() {
                // Before returning, let's load all values.
                const models = this.current;

                if (!Array.isArray(models)) {
                    return;
                }

                for (let i = 0; i < models.length; i++) {
                    let current = models[i];

                    // "Instance of Entity" check is enough at this point.
                    if (hasFields(current)) {
                        continue;
                    }

                    const modelClass = this.getEntitiesClass();
                    if (!modelClass) {
                        continue;
                    }

                    const id = getIdFromValue(current);
                    if (this.parent.isId(id)) {
                        const model = await modelClass.findById(id);
                        if (model) {
                            // If we initially had object with other data set, we must populate model with it, otherwise
                            // just set loaded model (because only an ID was received, without additional data).
                            if (current instanceof Object) {
                                model.populate(current);
                            }
                            models[i] = model;
                        }
                        // TODO: Could be a bug, what happens with object that wasn't loaded properly?
                        // TODO: We throw exception?
                        continue;
                    }

                    if (current instanceof Object) {
                        models[i] = new modelClass().populate(current);
                    }
                }
            },

            getEntitiesClass(): ?Class<Entity> {
                return this.classes.models.class;
            },

            getUsingClass(): ?Class<Entity> {
                let modelsClass = this.classes.using.class;
                if (!modelsClass) {
                    return null;
                }

                if (modelsClass.name) {
                    return modelsClass;
                }

                if (typeof modelsClass === "function") {
                    return modelsClass();
                }
            },

            getEntitiesField(): ?string {
                return this.classes.models.field;
            },

            getUsingField(): ?string {
                return this.classes.using.field;
            },

            setUsing(modelClass: Class<Entity>, modelField: ?string) {
                this.classes.using.class = modelClass;
                if (typeof modelField === "undefined") {
                    this.classes.using.field = firstCharacterToLower(
                        getName(this.classes.models.class)
                    );
                } else {
                    this.classes.using.field = modelField;
                }

                return this;
            },

            async deleteInitialLinks(): Promise<void> {
                // If initial is empty, that means nothing was ever loaded (attribute was not accessed) and there is nothing to do.
                // Otherwise, deleteInitial method will internally delete only models that are not needed anymore.

                if (!this.links.initial.length) {
                    return;
                }

                const initialLinks = this.links.initial,
                    // $FlowFixMe
                    currentLinksIds = this.links.current.map(model => model.id);

                for (let i = 0; i < initialLinks.length; i++) {
                    const initial = initialLinks[i];
                    // $FlowFixMe
                    if (!currentLinksIds.includes(initial.id)) {
                        hasFields(initial) && (await initial.delete());
                    }
                }
            },

            /**
             * Creates a new array that contains all currently loaded models.
             */
            syncInitialLinks(): void {
                this.links.initial = [...this.links.current];
            },

            /**
             * Sets current links, based on initial and currently set models.
             *
             * How links-management works?
             * When models are set, on "__save" event, attribute will be first loaded - meaning all initial (from storage)
             * linked models and its links will be loaded ("this.initial" / "this.links.initial"). After that, this method
             * will iterate over all newly set models, and check if for each a link is already existing. If so, it will
             * use it, otherwise a new instance is created, linking parent and set model together.
             *
             * Additional note: previously, there was an idea that link models could also contain additional information.
             * This still could works for lists in which models are all unique, meaning all models show only once in
             * the list. In cases where a single model can appear more than once, this might not be the best solution, since
             * linking problems can appear.
             *
             * Eg. if user has a list of models: A - A - B - C, and if links have a specific information, reordering
             * first two A models wouldn't make a difference, and nothing would be updated.
             *
             * But generally, this is a bad approach to have, in cases where links need to have additional data, a new model
             * would have to be made, linking the A product and containing all needed information.
             *
             * Basic example of this is a cart, with added products. Added product might appear many times, in different
             * colors and sizes, so here it would be best to just create CartItem model, that links the product and contains
             * needed information.
             *
             * Link models can be extended with additional attributes where it's sure that no duplicates can occur.
             * @returns {Promise<void>}
             */
            async manageCurrentLinks(): Promise<void> {
                const links = [],
                    current = this.current,
                    currentLinks = this.links.initial;

                for (let i = 0; i < current.length; i++) {
                    const currentEntity = current[i];

                    // Following chunk actually represents: "_.find(currentLinks, link => link.<model> === current);".
                    // "for" loop used because of async operations.
                    let link = null;
                    for (let j = 0; j < currentLinks.length; j++) {
                        // $FlowFixMe
                        const linkedEntity = await currentLinks[j][this.getUsingField()];
                        if (linkedEntity === currentEntity) {
                            link = currentLinks[j];
                            break;
                        }
                    }

                    // If model has an already existing link instance, it will be used. Otherwise a new instance will be created.
                    // Links array cannot contain two same instances.
                    if (link && !links.includes(link)) {
                        links.push(link);
                    } else {
                        const attr = {};

                        attr.usingClass = this.getUsingClass();
                        attr.usingAttribute = this.getUsingField();
                        attr.modelsAttribute = this.getEntitiesField();

                        if (attr.usingClass && attr.usingAttribute && attr.modelsAttribute) {
                            const model = new attr.usingClass();
                            model[attr.usingAttribute] = currentEntity;
                            model[attr.modelsAttribute] = this.parent;
                            links.push(model);
                        }
                    }
                }

                this.links.set = true;
                if (this.isDifferentFrom(links)) {
                    this.links.dirty = true;
                }

                this.links.current = links;
            }
        };
    });
};
