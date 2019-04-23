// @flow
import { withFields } from "@commodo/fields";
import id from "./id.js";

export default () => {
    return withFields({
        id: id()
    });
};
