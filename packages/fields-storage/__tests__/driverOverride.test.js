import User from "./resources/models/User";
import { CustomDriver } from "./resources/CustomDriver";
import { withStorage } from "@commodo/fields-storage";
import { compose } from "ramda";

describe("driver override test", () => {
    test("should use basic driver", async () => {
        const user = new User();
        expect(user.getStorageDriver()).toBeInstanceOf(CustomDriver);
    });

    test("should use CustomDriver override", async () => {
        class EvenMoreCustomDriver extends CustomDriver {}
        const CustomUser = compose(withStorage({ driver: new CustomDriver() }))();

        const user = new CustomUser();
        expect(user.getStorageDriver()).toBeInstanceOf(CustomDriver);

        CustomUser.__storage.driver = new EvenMoreCustomDriver();
        expect(CustomUser.getStorageDriver()).toBeInstanceOf(EvenMoreCustomDriver);
    });
});
