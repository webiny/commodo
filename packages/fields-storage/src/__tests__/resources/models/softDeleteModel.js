import Entity from "webiny-model/model";

class EntityWithoutSoftDeletes extends Entity {
    constructor() {
        super();
        this.attr("name").char();
    }
}

EntityWithoutSoftDeletes.classId = "EntityWithoutSoftDeletes";

class EntityWithSoftDeletes extends Entity {
    constructor() {
        super();
        this.attr("name").char();
    }
}

EntityWithSoftDeletes.classId = "EntityWithSoftDeletes";
EntityWithSoftDeletes.crud = {
    delete: {
        soft: true
    },
    logs: true
};

export { EntityWithoutSoftDeletes, EntityWithSoftDeletes };
