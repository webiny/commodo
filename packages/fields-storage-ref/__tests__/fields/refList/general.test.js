import {
    MainEntity,
    Entity1,
    Entity2,
    MainSetOnceEntity
} from "../../resources/models/modelsAttributeModels";
import sinon from "sinon";
import { Collection } from "@commodo/fields-storage";
import { withFields, string } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import createModel from "./../../resources/models/createModel";
import mdbid from "mdbid";

const sandbox = sinon.createSandbox();

describe("attribute models test", () => {
    afterEach(() => sandbox.restore());
    beforeEach(() => MainEntity.getStoragePool().flush());

    test("if an instance of Collection was passed, it should be directly assigned", async () => {
        const model = new MainEntity();
        model.getField("attribute1").setValue(new Collection());

        let value = await model.attribute1;
        expect(value.length).toBe(0);
        expect(value).toBeInstanceOf(Collection);

        model.attribute1 = new Collection([new Entity1(), new Entity1()]);

        value = await model.attribute1;
        expect(value.length).toBe(2);
        expect(value).toBeInstanceOf(Collection);
    });

    test("should not change attribute1 since it has setOnce applied - attribute2 should be emptied", async () => {
        const mainSetOnceEntity = new MainSetOnceEntity();
        mainSetOnceEntity.attribute1 = [
            { name: "Enlai", type: "dog" },
            { name: "Rocky", type: "dog" },
            { name: "Lina", type: "bird" }
        ];
        mainSetOnceEntity.attribute2 = [
            { firstName: "John", lastName: "Doe" },
            { firstName: "Jane", lastName: "Doe" }
        ];

        let attribute1 = await mainSetOnceEntity.attribute1;
        expect(attribute1[0].name).toEqual("Enlai");
        expect(attribute1[1].name).toEqual("Rocky");
        expect(attribute1[2].name).toEqual("Lina");

        mainSetOnceEntity.attribute1 = [];
        mainSetOnceEntity.attribute2 = [];

        attribute1 = await mainSetOnceEntity.attribute1;
        expect(attribute1).toBeTruthy();
        expect(attribute1[0].name).toEqual("Enlai");
        expect(attribute1[1].name).toEqual("Rocky");
        expect(attribute1[2].name).toEqual("Lina");
        expect(attribute1[3]).toBeUndefined();

        expect((await mainSetOnceEntity.attribute2).length).toBe(0);
    });

    test("should lazy load any of the accessed linked models", async () => {
        const ids = {
            xyz: mdbid(),
            AA: mdbid(),
            twelve: mdbid(),
            thirteen: mdbid()
        };
        const modelFind = sandbox.stub(MainEntity.getStorageDriver(), "findOne").callsFake(() => {
            return { id: ids.xyz };
        });

        const mainEntity = await MainEntity.findById(ids.xyz);
        modelFind.restore();

        const modelsFind = sandbox
            .stub(mainEntity.getStorageDriver(), "find")
            .onCall(0)
            .callsFake(() => {
                return [
                    [
                        { id: ids.AA, name: "Bucky", type: "dog" },
                        { id: ids.twelve, name: "Rocky", type: "dog" }
                    ]
                ];
            })
            .onCall(1)
            .callsFake(() => {
                return [[{ id: ids.thirteen, firstName: "Foo", lastName: "Bar" }]];
            });

        expect(Array.isArray(mainEntity.getField("attribute1").current)).toBe(true);
        expect(mainEntity.getField("attribute1").current.length).toBe(0);
        expect(Array.isArray(mainEntity.getField("attribute2").current)).toBe(true);
        expect(mainEntity.getField("attribute2").current.length).toBe(0);

        const attribute1 = await mainEntity.attribute1;
        expect(attribute1).toBeInstanceOf(Collection);
        expect(attribute1.length).toBe(2);
        expect(attribute1[0].id).toEqual(ids.AA);
        expect(attribute1[1].id).toEqual(ids.twelve);
        expect(attribute1[0]).toBeInstanceOf(Entity1);
        expect(attribute1[1]).toBeInstanceOf(Entity1);

        const attribute2 = await mainEntity.attribute2;
        expect(attribute2).toBeInstanceOf(Collection);
        expect(attribute2.length).toBe(1);
        expect(attribute2[0].id).toEqual(ids.thirteen);
        expect(attribute2[0]).toBeInstanceOf(Entity2);

        modelsFind.restore();
    });

    test("should set internal loaded flag to true when called for the first time, and no findById calls should be made", async () => {
        const ids = { oneTwoThree: mdbid() };
        const modelFind = sandbox
            .stub(MainEntity.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: ids.oneTwoThree };
            });

        const mainEntity = await MainEntity.findById(ids.oneTwoThree);
        modelFind.restore();

        const modelsFind = sandbox.spy(mainEntity.getStorageDriver(), "find");

        expect(mainEntity.getField("attribute1").current).toBeInstanceOf(Collection);
        expect(mainEntity.getField("attribute1").current.length).toBe(0);

        mainEntity.attribute1;
        mainEntity.attribute1;
        await mainEntity.attribute1;
        await mainEntity.attribute1;
        expect(modelsFind.callCount).toEqual(1);

        const attribute1 = await mainEntity.attribute1;
        expect(modelsFind.callCount).toEqual(1);

        modelsFind.restore();
        modelFind.restore();

        expect(attribute1).toBeInstanceOf(Collection);
        expect(attribute1.length).toBe(0);
    });

    test("on new models, no find calls should be made", async () => {
        const mainEntity = new MainEntity();

        const modelsFind = sandbox.spy(mainEntity.getStorageDriver(), "find");
        expect(mainEntity.getField("attribute1").current).toBeInstanceOf(Collection);
        expect(mainEntity.getField("attribute1").current.length).toBe(0);

        mainEntity.attribute1;
        mainEntity.attribute1;
        await mainEntity.attribute1;
        await mainEntity.attribute1;
        expect(modelsFind.callCount).toEqual(0);

        const attribute1 = await mainEntity.attribute1;
        expect(modelsFind.callCount).toEqual(0);

        modelsFind.restore();

        expect(attribute1).toBeInstanceOf(Collection);
        expect(attribute1.length).toBe(0);
    });

    test("setUsing method must set all passed parameters correctly", async () => {
        const model = new MainEntity();
        model.getField("attribute1").setUsing(Entity2, "customAttribute");

        expect(model.getField("attribute1").classes).toEqual({
            models: {
                field: "mainEntity",
                class: Entity1
            },
            parent: "MainEntity",
            using: {
                field: "customAttribute",
                class: Entity2
            }
        });
    });

    test(`"using" argument set as array that contains instanceOf and fieldName - test 1`, async () => {
        const MainEntity = compose(
            withFields({
                attribute1: ref({
                    list: true,
                    instanceOf: Entity1,
                    using: [Entity2, "customAttribute"]
                })
            }),
            withName("MainEntity")
        )(createModel());

        const model = new MainEntity();

        expect(model.getField("attribute1").classes).toEqual({
            models: {
                field: "mainEntity",
                class: Entity1
            },
            parent: "MainEntity",
            using: {
                field: "customAttribute",
                class: Entity2
            }
        });
    });

    test(`"using" argument set as array that contains instanceOf and fieldName - test 2`, async () => {
        const SecurityGroup = compose(
            withFields({
                name: string()
            }),
            withName("SecurityGroup")
        )(createModel());

        const SecurityGroups2Entities = compose(
            withFields({
                entity: ref({ instanceOf: [], refNameField: "entityClassId" }),
                entityClassId: string(),
                group: ref({ instanceOf: SecurityGroup })
            }),
            withName("SecurityGroups2Entities")
        )(createModel());

        const SecurityUser = compose(
            withFields({
                groups: ref({
                    list: true,
                    instanceOf: [SecurityGroup, "entity"],
                    using: [SecurityGroups2Entities, "group"]
                })
            }),
            withName("SecurityUser")
        )(createModel());

        const user = new SecurityUser();
        expect(user.getField("groups").classes).toEqual({
            models: {
                field: "entity",
                class: SecurityGroup
            },
            parent: "SecurityUser",
            using: {
                field: "group",
                class: SecurityGroups2Entities
            }
        });
    });
});
