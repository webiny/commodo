import NeDbDataStore from "nedb-promises";

class Database {
    constructor() {
        this.dataStore = {};
    }

    collection(name) {
        if (!this.dataStore[name]) {
            this.dataStore[name] = new NeDbDataStore();
        }

        return this.dataStore[name];
    }
}

export default Database;
