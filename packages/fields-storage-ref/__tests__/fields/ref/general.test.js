import { User, Company, Image } from "../../resources/models/userCompanyImage";
import { One } from "../../resources/models/oneTwoThree";
import { UsersGroups } from "../../resources/models/modelsUsing";
import sinon from "sinon";
import { withFields, string, setOnce } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import createModel from "./../../resources/models/createModel";
import mdbid from "mdbid";
const sandbox = sinon.createSandbox();

describe("model attribute test", () => {
    afterEach(() => sandbox.restore());
    beforeEach(() => User.getStoragePool().flush());

    test("should set root and nested values correctly", async () => {
        const user = new User();

        user.firstName = "John";
        user.lastName = "Doe";
        user.company = {
            name: "Company",
            image: {
                filename: "image.jpg",
                size: 123.45
            }
        };

        const company = await user.company;
        const image = await company.image;

        expect(user.firstName).toEqual("John");
        expect(user.lastName).toEqual("Doe");
        expect(company).toBeInstanceOf(Company);
        expect(await company.image).toBeInstanceOf(Image);
        expect(company.name).toEqual("Company");
        expect(image.filename).toEqual("image.jpg");
        expect(image.size).toEqual(123.45);

        image.filename = "image222.jpg";
        image.size = 234.56;

        expect(image.filename).toEqual("image222.jpg");
        expect(image.size).toEqual(234.56);
    });

    test("should populate values correctly", async () => {
        const user = new User();
        user.populate({
            firstName: "John",
            lastName: "Doe",
            company: {
                name: "Company",
                image: {
                    filename: "image.jpg",
                    size: 123.45
                }
            }
        });

        const company = await user.company;
        const image = await company.image;

        expect(user.firstName).toEqual("John");
        expect(user.lastName).toEqual("Doe");
        expect(company).toBeInstanceOf(Company);
        expect(image).toBeInstanceOf(Image);
        expect(company.name).toEqual("Company");
        expect(image.filename).toEqual("image.jpg");
        expect(image.size).toEqual(123.45);
    });

    test("should set model only once using setter and populate methods", async () => {
        const Secondary = compose(
            withName("Secondary"),
            withFields({
                name: string({
                    validation: value => {
                        if (!value) {
                            throw new Error("Name is required.");
                        }
                    }
                })
            })
        )(createModel());

        const Primary = compose(
            withFields({
                name: string({
                    validation: value => {
                        if (!value) {
                            throw new Error("Name is required.");
                        }
                    }
                }),
                secondary: setOnce()(ref({ instanceOf: Secondary }))
            }),
            withName("Primary")
        )(createModel());

        const secondary1 = new Secondary();
        secondary1.name = "secondary1";

        const primary = new Primary();
        primary.name = "primary";
        primary.secondary = secondary1;

        expect(primary.name).toEqual("primary");

        let secondary = await primary.secondary;
        expect(secondary.name).toEqual("secondary1");

        const secondary2 = new Secondary();
        secondary2.name = "secondary2";

        primary.secondary = secondary2;

        secondary = await primary.secondary;
        expect(primary.name).toEqual("primary");
        expect(secondary.name).toEqual("secondary1");
    });

    test("should throw an exception", async () => {
        const mainModel = new One();

        const modelPopulate = sandbox.stub(mainModel.getField("two"), "setValue").callsFake(() => {
            throw Error("Error was thrown.");
        });

        let error = null;
        try {
            await mainModel.set("two", []);
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(Error);
        modelPopulate.restore();
    });

    test("must set model to null", async () => {
        const model = new User();
        model.company = { name: "Test-1" };

        expect(await model.company).toBeInstanceOf(Company);

        model.company = null;
        expect(await model.company).toBeNull();
    });

    test("should return null because no data was assigned", async () => {
        const model = new User();
        expect(await model.company).toBeNull();
    });

    test("should lazy load any of the accessed linked models", async () => {
        const ids = {
            one: mdbid(),
            two: mdbid(),
            three: mdbid(),
            four: mdbid(),
            anotherFour: mdbid(),
            five: mdbid(),
            six: mdbid()
        };
        let findById = sandbox
            .stub(One.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: ids.one, name: "One", two: ids.two };
            })
            .onCall(1)
            .callsFake(() => {
                return { id: ids.two, name: "Two", three: ids.three };
            })
            .onCall(2)
            .callsFake(() => {
                return {
                    id: ids.three,
                    name: "Three",
                    four: ids.four,
                    anotherFour: ids.anotherFour,
                    five: ids.five,
                    six: ids.six
                };
            })
            .onCall(3)
            .callsFake(() => {
                return { id: ids.four, name: "Four" };
            })
            .onCall(4)
            .callsFake(() => {
                return { id: ids.anotherFour, name: "Another Four" };
            })
            .onCall(5)
            .callsFake(() => {
                return { id: ids.five, name: "Five" };
            })
            .onCall(6)
            .callsFake(() => {
                return { id: ids.six, name: "Six" };
            });

        const one = await One.findById(ids.one);
        expect(one.id).toEqual(ids.one);
        expect(one.name).toEqual("One");
        expect(one.getField("two").current).toEqual(ids.two);

        const two = await one.two;
        expect(two.id).toEqual(ids.two);
        expect(two.name).toEqual("Two");

        expect(two.getField("three").current).toEqual(ids.three);

        const three = await two.three;
        expect(three.id).toEqual(ids.three);
        expect(three.name).toEqual("Three");

        expect(three.getField("four").current).toEqual(ids.four);

        const four = await three.four;
        expect(four.id).toEqual(ids.four);
        expect(four.name).toEqual("Four");

        const anotherFour = await three.anotherFour;
        expect(anotherFour.id).toEqual(ids.anotherFour);
        expect(anotherFour.name).toEqual("Another Four");

        const five = await three.five;
        expect(five.id).toEqual(ids.five);
        expect(five.name).toEqual("Five");

        const six = await three.six;
        expect(six.id).toEqual(ids.six);
        expect(six.name).toEqual("Six");

        findById.restore();
    });

    test("should set internal loaded flag to true when called for the first time, and no findById calls should be made", async () => {
        const ids = {
            one: mdbid(),
            two: mdbid()
        };

        let findById = sandbox
            .stub(One.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: ids.one, name: "One" };
            });

        const one = await One.findById(ids.one);
        findById.restore();

        expect(one.getField("two").current).toEqual(null);
        expect(one.getField("two").state.loaded).toBe(false);
        expect(one.getField("two").state.loading).toBe(false);

        findById = sandbox.spy(One.getStorageDriver(), "findOne");
        one.two;
        one.two;
        await one.two;
        await one.two;

        expect(findById.callCount).toEqual(0);
        expect(one.getField("two").current).toEqual(null);
        expect(one.getField("two").state.loaded).toBe(true);
        expect(one.getField("two").state.loading).toBe(false);

        await one.two;

        expect(findById.callCount).toEqual(0);
        expect(one.getField("two").current).toEqual(null);
        expect(one.getField("two").state.loaded).toBe(true);
        expect(one.getField("two").state.loading).toBe(false);

        findById.restore();
    });

    test("should not load if values are already set", async () => {
        const mainEntity = new One();
        const modelCreate = sandbox.spy(UsersGroups.getStorageDriver(), "create");
        const modelUpdate = sandbox.spy(UsersGroups.getStorageDriver(), "update");
        const modelFind = sandbox.spy(UsersGroups.getStorageDriver(), "find");
        const modelFindById = sandbox.spy(UsersGroups.getStorageDriver(), "findOne");

        await mainEntity.two;

        expect(modelCreate.callCount).toBe(0);
        expect(modelUpdate.callCount).toBe(0);
        expect(modelFind.callCount).toBe(0);
        expect(modelFindById.callCount).toBe(0);

        await mainEntity.two;

        expect(modelCreate.callCount).toBe(0);
        expect(modelUpdate.callCount).toBe(0);
        expect(modelFind.callCount).toBe(0);
        expect(modelFindById.callCount).toBe(0);

        modelCreate.restore();
        modelUpdate.restore();
        modelFind.restore();
        modelFindById.restore();
    });
});
