import { withStaticProps, withProps } from "repropose";

const withIndexes = indexes => {
    return function(fn) {
        return withProps({ __withIndexes: indexes })(withStaticProps({ __withIndexes: indexes })(fn));
    };
};

export default withIndexes;
