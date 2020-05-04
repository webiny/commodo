import mongodb from "mongodb";

export default count => {
    const ids = [];
    for (let i = 0; i < count; i++) {
        ids.push(new mongodb.ObjectID());
    }

    return ids;
};
