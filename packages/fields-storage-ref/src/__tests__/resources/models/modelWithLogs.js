import Entity from "webiny-model/model";

class EntityWithoutLogs extends Entity {
    constructor() {
        super();
        this.attr("name").char();
    }
}

EntityWithoutLogs.classId = "EntityWithoutLogs";

class ModelWithLogs extends Entity {
    constructor() {
        super();
        this.attr("name").char();
    }
}

ModelWithLogs.classId = "EntityWithLogs";
ModelWithLogs.crud = {
    logs: true
};

export { EntityWithoutLogs, ModelWithLogs };
