import { withStaticProps } from "repropose";

const withKey = (...params) => {
    let newKey;
    if (typeof params[0] === "string") {
        newKey = {
            fields: params.map(item => ({ name: item }))
        };
    } else {
        newKey = params[0];
    }

    if (!newKey.name) {
        newKey.name = newKey.fields.map(item => item.name).join("_");
    }

    return function(fn) {
        if (!fn.__storageKeys) {
            withStaticProps({ __storageKeys: [newKey] })(fn);
        } else {
            fn.__storageKeys.push(newKey);
        }

        return fn;
    };
};

export default withKey;
