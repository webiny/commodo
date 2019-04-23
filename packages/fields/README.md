![alt text](docs/assets/logo.png "Logo Title Text 1")

```
import { string, number, boolean } from "@commodo/fields/fields";
import { withFields } from "@commodo/fields";
import { withProps } from "repropose";
import { compose } from "ramda";

const User = compose(
        withFields({
            firstName: string(),
            lastName: string(),
            email: string(),
            age: string(),
            enabled: string()
        })
    )(function() {});

    const user = new User();