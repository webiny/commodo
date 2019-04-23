import { Entity } from "webiny-model";

class User extends Entity {
    constructor() {
        super();
        this.attr("name").char();
        this.attr("groups")
            .models(Group)
            .setToStorage()
            .setUsing(UsersGroups);
    }
}

User.classId = "User";

class Group extends Entity {
    constructor() {
        super();
        this.attr("name").char();
    }
}

Group.classId = "Group";

class UsersGroups extends Entity {
    constructor() {
        super();
        this.attr("user")
            .model(User)
            .setToStorage();

        this.attr("group")
            .model(Group)
            .setToStorage();
    }
}

UsersGroups.classId = "UsersGroups";

export { User, Group, UsersGroups };
