import { withStaticProps, withProps } from "repropose";

const withName = name => {
    return function(fn) {
        return withProps({ __withName: name })(withStaticProps({ __withName: name })(fn));
    };
};

export default withName;
