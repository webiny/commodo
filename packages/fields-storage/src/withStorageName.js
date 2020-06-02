import { withStaticProps, withProps } from "repropose";

const withStorageName = storageName => {
    return function(fn) {
        return withProps({ __withStorageName: storageName })(withStaticProps({ __withStorageName: storageName })(fn));
    };
};

export default withStorageName;
