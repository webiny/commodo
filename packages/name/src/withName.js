import { withStaticProps, withProps } from "repropose";
// todo: remove ramda!

import { compose } from "ramda";

const withName = name => {
    return compose(
        withProps({
            __withName: name
        }),
        withStaticProps({
            __withName: name
        })
    );
};

export default withName;
