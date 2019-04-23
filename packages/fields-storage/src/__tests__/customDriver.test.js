import { compose } from "ramda";
import { withFields, string, number, boolean } from "@commodo/fields";
import { withStorage } from "@commodo/fields-storage";
import { withName } from "@commodo/name";
import { CustomDriver } from "./resources/CustomDriver";

const User = compose(
    withFields({
        id: string({ name: "id" }),
        firstName: string({ name: "firstName" }),
        lastName: string({ name: "lastName" }),
        age: number({ name: "age" }),
        enabled: boolean({ name: "enabled", value: true })
    }),
    withStorage({
        driver: new CustomDriver()
    }),
    withName("User")
)(function() {});

describe("custom driver test", () => {
    test("should have CustomDriver set as driver", async () => {
        const user = new User();
        expect(user.getStorageDriver()).toBeInstanceOf(CustomDriver);
    });

    test("should save models and then find them", async () => {
        const user1 = new User();
        user1.populate({ firstName: "John", lastName: "Doe", age: 30 });
        await user1.save();

        const user2 = new User();
        user2.populate({ firstName: "Jane", lastName: "Doe", age: 25 });
        await user2.save();

        const user3 = new User();
        user3.populate({ firstName: "Foo", lastName: "Bar", age: 100, enabled: false });
        await user3.save();

        const users = await User.find();
        expect(users.length).toBe(3);

        expect(users[0].age).toEqual(30);
        expect(users[1].age).toEqual(25);
        expect(users[2].age).toEqual(100);
    });

    test("should return only one user", async () => {
        const user1 = new User();
        user1.populate({ firstName: "John", lastName: "Doe", age: 250 });
        await user1.save();

        const user2 = new User();
        user2.populate({ firstName: "John Old", lastName: "Doe Old", age: 350 });
        await user2.save();

        const users1 = await User.find({ query: { age: 250 } });
        expect(users1.length).toBe(1);
        expect(users1[0].firstName).toEqual("John");

        const users2 = await User.find({ query: { age: 350 } });
        expect(users2.length).toBe(1);
        expect(users2[0].firstName).toEqual("John Old");
    });

    test("should find by given ID correctly", async () => {
        const user1 = new User();
        user1.populate({ firstName: "John", lastName: "Doe", age: 250 });
        await user1.save();

        const noUser = await User.findById();
        expect(noUser).toBeNull();

        const foundUser = await User.findById(user1.id);
        expect(foundUser.id).toEqual(user1.id);
    });

    test("should delete model", async () => {
        const user1 = new User();
        user1.populate({ firstName: "John Older", lastName: "Doe Older", age: 500 });
        await user1.save();

        const user2 = new User();
        user2.populate({ firstName: "John Oldest", lastName: "Doe Oldest", age: 1000 });
        await user2.save();

        const user1Find = await User.findOne({ query: { age: 500 } });
        await user1Find.delete();

        const user1FindAgain = await User.findOne({ query: { age: 500 } });
        expect(user1FindAgain).toBeNull();
    });

    test("should count models", async () => {
        const currentCount = await User.count();
        expect(typeof currentCount).toBe("number");

        const user1 = new User();
        user1.populate({ firstName: "John Older", lastName: "Doe Older", age: 5000 });
        await user1.save();

        const user2 = new User();
        user2.populate({ firstName: "John Oldest", lastName: "Doe Oldest", age: 10000 });
        await user2.save();

        expect(await User.count()).toEqual(currentCount + 2);
        expect(await User.count({ query: { age: 5000 } })).toEqual(1);
        expect(await User.count({ query: { age: 10000 } })).toEqual(1);
    });
});
