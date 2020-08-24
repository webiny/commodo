import withKey from "./withKey";

const withUniqueKey = (...params) => {
    let key;
    if (typeof params[0] === "string") {
        key = {
            fields: params.map(item => ({ name: item }))
        };
    } else {
        key = params[0];
    }

    key.unique = true;

    return withKey(key);
};

export default withUniqueKey;
