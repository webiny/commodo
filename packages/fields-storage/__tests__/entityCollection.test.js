import User from "./resources/models/User";
import { Collection } from "@commodo/fields-storage";

const getEntities = () => [
    new User().populate({ id: "A", age: 30 }),
    new User().populate({ id: "B", age: 35 }),
    new User().populate({ id: "C", age: 40 })
];

describe("Collection test", () => {
    test("must correctly accept an array of entities", async () => {
        const entities = getEntities();
        const collection = new Collection(entities);
        expect(collection).toHaveLength(3);
        expect(collection[0].age).toEqual(30);
        expect(collection[1].age).toEqual(35);
        expect(collection[2].age).toEqual(40);
    });

    test("must correctly push new entities and all other values without throwing errors", async () => {
        const entities = getEntities();
        const collection = new Collection(entities);

        collection.push(new User().populate({ age: 45 }));
        expect(collection).toHaveLength(4);
        expect(collection[3].age).toEqual(45);
        collection.push(1);
        collection.push({ age: 50 });

        expect(collection).toHaveLength(6);
        expect(collection[3].age).toEqual(45);
    });

    test("must NOT throw an error on construct, if one of the values is not an instance of Entity", async () => {
        new Collection([new User(), new User(), { id: 123 }]);
    });

    test("setParams/getParams methods must work correctly", async () => {
        const collection = new Collection();
        collection.setParams({ a: 123 });
        expect(collection.getParams().a).toEqual(123);
    });

    test("setMeta/getMeta methods must work correctly", async () => {
        const collection = new Collection();
        collection.setMeta({ a: 123 });
        expect(collection.getMeta().a).toEqual(123);
    });
});
