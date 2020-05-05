import { User, Company, CompanyWithSisterCompany } from "../../resources/models/userCompanyImage";
import { One } from "../../resources/models/oneTwoThree";
import sinon from "sinon";
import mdbid from "mdbid";
import idGenerator from "@commodo/fields-storage/idGenerator";

const sandbox = sinon.createSandbox();

describe("model attribute test", () => {
    afterEach(() => sandbox.restore());
    beforeEach(() => User.getStoragePool().flush());

    test("should return model from storage", async () => {
        const model = new User();
        model.getField("company").setStorageValue("A");
        expect(model.getField("company").current).toBe("A");

        sandbox.stub(Company.getStorageDriver(), "findOne").callsFake(() => {
            return { id: "A", name: "TestCompany" };
        });

        const company = await model.company;
        Company.getStorageDriver().findOne.restore();

        expect(company).toBeInstanceOf(Company);
        model.company.name = "TestCompany";
    });

    test("should return correct storage value", async () => {
        const model = new User();

        const ids = { B: mdbid(), one: mdbid(), five: mdbid() };

        model.getField("company").setStorageValue(ids.one);
        expect(await model.getField("company").getStorageValue()).toEqual(ids.one);

        const findById = sandbox
            .stub(model.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: ids.one, name: "TestCompany" };
            })
            .onCall(1)
            .callsFake(model => {
                model.id = ids.B;
                return true;
            });

        model.company = { id: ids.five, name: "Test-1" };
        await model.company;
        expect(await model.getField("company").getStorageValue()).toEqual(ids.five);

        model.company = null;
        await model.company;
        expect(await model.getField("company").getStorageValue()).toEqual(null);

        findById.restore();
    });

    test("should be able to make links to the same model class", async () => {
        const ids = { A: mdbid(), one: mdbid(), five: mdbid() };
        const model = new CompanyWithSisterCompany();
        model.populate({
            name: "company1"
        });

        let generateIdStub = sandbox.stub(idGenerator, "generate").callsFake(() => ids.A);

        await model.save();

        const model2 = new CompanyWithSisterCompany();
        model2.populate({
            name: "company2",
            sister: model.id
        });
        await model2.save();

        generateIdStub.restore();
    });

    test("it should auto save linked model only if it is enabled", async () => {
        const user = new User();

        const A = mdbid();
        let saveSpy = sandbox.spy(user.getStorageDriver(), "save");
        let generateIdStub = sandbox.stub(idGenerator, "generate").callsFake(() => A);

        user.populate({
            firstName: "John",
            lastName: "Doe",
            company: {
                name: "Company",
                image: {
                    size: 123.45,
                    filename: "test.jpg"
                }
            }
        });

        user.getField("company").setAutoSave(false);
        await (await user.company).image;

        user.getField("company")
            .current.getField("image")
            .setAutoSave(false);

        await user.save();

        saveSpy.restore();
        generateIdStub.restore();

        expect(saveSpy.callCount).toEqual(1);
        expect(user.id).toEqual(A);

        user.getField("company").setAutoSave();

        const B = mdbid();

        // This time we should have an update on User model, and insert on linked company model
        saveSpy = sandbox.spy(user.getStorageDriver(), "save");
        generateIdStub = sandbox
            .stub(idGenerator, "generate")
            .onCall(0)
            .callsFake(() => B);

        await user.save();

        saveSpy.restore();
        generateIdStub.restore();

        expect(saveSpy.calledTwice).toBeTruthy();
        expect(user.id).toEqual(A);
        expect((await user.company).id).toEqual(B);

        // Finally, let's set auto save on image model too.

        user.getField("company")
            .current.getField("image")
            .setAutoSave();

        // This time we should have an update on User model, update on company model and insert on linked image model.
        // Additionally, image model has a createdBy attribute, but since it's empty, nothing must happen here.

        const C = mdbid();
        saveSpy = sandbox.spy(user.getStorageDriver(), "save");
        generateIdStub = sandbox
            .stub(idGenerator, "generate")
            .onCall(0)
            .callsFake(() => C);

        await user.save();

        saveSpy.restore();
        generateIdStub.restore();

        expect(saveSpy.callCount).toEqual(2);
        expect(user.id).toEqual(A);
        const company = await user.company;
        const image = await company.image;
        expect(company.id).toEqual(B);
        expect(image.id).toEqual(C);
    });

    test("auto save must be automatically enabled", async () => {
        const user = new User();
        user.populate({
            firstName: "John",
            lastName: "Doe",
            company: {
                name: "Company",
                image: {
                    size: 123.45,
                    filename: "test.jpg"
                }
            }
        });

        const A = mdbid();
        const B = mdbid();
        const C = mdbid();

        let saveSpy = sandbox.spy(user.getStorageDriver(), "save");
        let generateIdStub = sandbox
            .stub(idGenerator, "generate")
            .onCall(0)
            .callsFake(() => C)
            .onCall(1)
            .callsFake(() => B)
            .onCall(2)
            .callsFake(() => A);

        await user.save();

        saveSpy.restore();
        generateIdStub.restore();

        expect(saveSpy.callCount).toBe(3);
        expect(user.id).toEqual(A);

        const company = await user.company;
        const image = await company.image;
        expect(company.id).toEqual(B);
        expect(image.id).toEqual(C);
    });

    test("should not trigger saving of same model (that might be also linked in an another linked model) twice in one save process", async () => {
        const user = new User();
        user.populate({
            firstName: "John",
            lastName: "Doe",
            company: {
                name: "Company",
                image: {
                    size: 123.45,
                    filename: "test.jpg",
                    createdBy: user
                }
            }
        });

        const A = mdbid();
        const B = mdbid();
        const C = mdbid();

        let saveSpy = sandbox.spy(user.getStorageDriver(), "save");
        let generateIdStub = sandbox
            .stub(idGenerator, "generate")
            .onCall(0)
            .callsFake(() => C)
            .onCall(1)
            .callsFake(() => B)
            .onCall(2)
            .callsFake(() => A);

        await user.save();

        saveSpy.restore();
        generateIdStub.restore();

        expect(saveSpy.calledThrice).toBeTruthy();
        expect(user.id).toEqual(A);

        const company = await user.company;
        expect(company.id).toEqual(B);
        expect((await company.image).id).toEqual(C);
    });

    test("should not trigger save on linked model since it was not loaded", async () => {
        const ids = {
            one: mdbid(),
            two: mdbid()
        };

        const findById = sandbox
            .stub(One.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: ids.one, name: "One", two: ids.two };
            });

        const one = await One.findById(ids.one);
        findById.restore();

        let saveSpy = sandbox.spy(One.getStorageDriver(), "save");

        await one.save();
        expect(saveSpy.callCount).toEqual(0);

        one.name = "asd";
        await one.save();

        expect(saveSpy.callCount).toEqual(1);
        saveSpy.restore();
    });

    test("should create new model and save links correctly", async () => {
        const ids = {
            one: mdbid(),
            two: mdbid(),
            three: mdbid(),
            anotherTwo: mdbid(),
            anotherThree: mdbid(),
            anotherFour: mdbid(),
            anotherFourFour: mdbid()
        };

        const findById = sandbox
            .stub(One.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: ids.one, name: "One" };
            });

        const one = await One.findById(ids.one);
        findById.restore();

        one.two = { name: ids.two, three: { name: ids.three } };

        let saveSpy = sandbox.spy(one.getStorageDriver(), "save");
        const generateIdStub = sandbox
            .stub(idGenerator, "generate")
            .onCall(0)
            .callsFake(() => ids.three)
            .onCall(1)
            .callsFake(() => ids.two);

        await one.save();
        saveSpy.restore();
        generateIdStub.restore();

        expect(saveSpy.calledThrice).toBeTruthy();

        expect(one.id).toEqual(ids.one);

        const two = await one.two;
        expect(two.id).toEqual(ids.two);

        const three = await two.three;
        expect(three.id).toEqual(ids.three);

        expect(await one.getField("two").getStorageValue()).toEqual(ids.two);
        expect(await two.getField("three").getStorageValue()).toEqual(ids.three);
    });

    test("should delete existing model once new one was assigned and main model saved", async () => {
        const ids = {
            one: mdbid(),
            two: mdbid(),
            three: mdbid()
        };

        let modelFindById = sandbox
            .stub(One.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: ids.one, name: "One", two: ids.two };
            });

        const one = await One.findById("a");
        expect(await one.getField("two").getStorageValue()).toEqual(ids.two);
        expect(one.getField("two").current).toEqual(ids.two);
        expect(one.getField("two").initial).toEqual(ids.two);

        // "one.two = ..." triggers loading of entity (ONLY WITH DEBUGGER), regular test run works just fine!!!
        // OMG -_-
        one.getField("two").setValue({
            name: "Another Two",
            three: {
                name: "Another Three",
                four: { name: "Another Four" },
                anotherFour: { name: "Another Four x2" }
            }
        });

        expect(modelFindById.callCount).toEqual(1);
        modelFindById.restore();

        // ... and now we can be sure the values are set and ready for testing.
        expect(one.getField("two").initial).toEqual(ids.two);
        expect(one.getField("two").current.id).toBe(undefined);
        expect(one.getField("two").state.loaded).toBe(false);
        expect(one.getField("two").state.loading).toBe(false);

        // This is what will happen once we execute save method on One model

        // 1. recursively call save method on all child entities.
        let saveSpy = sandbox.spy(One.getStorageDriver(), "save");
        let generateIdStub = sandbox
            .stub(idGenerator, "generate")
            .onCall(0)
            .callsFake(() => ids.anotherFour)
            .onCall(1)
            .callsFake(() => ids.anotherFourFour)
            .onCall(2)
            .callsFake(() => ids.anotherThree)
            .onCall(3)
            .callsFake(() => ids.anotherTwo);

        // 2. Once the save is done, deletes will start because main model has a different model on attribute 'two'.
        // Before deletions, findById method will be executed to recursively load entities and then of course delete
        // them (first model 'three' than 'two').
        modelFindById = sandbox
            .stub(One.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: ids.two, name: "Two", three: ids.three };
            })
            .onCall(1)
            .callsFake(() => {
                return { id: ids.three, name: "Three" };
            });

        let modelDelete = sandbox.stub(One.getStorageDriver(), "delete").callsFake(() => true);

        await one.save();

        expect(saveSpy.callCount).toEqual(5);
        expect(modelFindById.callCount).toEqual(2);

        // Make sure model with ID 'three' was first deleted, and then the one with ID 'two'.
        expect(modelDelete.getCall(0).args[0].data.id).toEqual(ids.three);
        expect(modelDelete.getCall(1).args[0].data.id).toEqual(ids.two);

        expect(one.getField("two").initial.id).toEqual(ids.anotherTwo);
        expect(one.getField("two").current.id).toEqual(ids.anotherTwo);
        expect(one.getField("two").state.loaded).toBe(true);
        expect(one.getField("two").state.loading).toBe(false);

        modelFindById.restore();
        modelDelete.restore();
        saveSpy.restore();
        generateIdStub.restore();
    });

    test("should load entities on save to make sure they exist", async () => {
        const ids = {
            one: mdbid(),
            two: mdbid(),
            three: mdbid(),
            anotherTwo: mdbid()
        };

        let modelFindById = sandbox
            .stub(One.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: ids.one, name: "One", two: ids.two };
            });

        const one = await One.findById(ids.one);

        expect(modelFindById.callCount).toEqual(1);
        modelFindById.restore();

        // one.getField('two').setValue("anotherTwo"); // Use this one for debugging.
        one.two = ids.anotherTwo; // Causes "loading" flag to be true, probably some kind of a babel/transpile issue.

        modelFindById = sandbox
            .stub(One.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: ids.two, name: "Two" };
            })
            .onCall(1)
            .callsFake(() => {
                return { id: ids.anotherTwo, name: "Another Two" };
            });

        let saveSpy = sandbox.spy(One.getStorageDriver(), "save");

        await one.save();

        expect(modelFindById.callCount).toEqual(2);
        expect(saveSpy.callCount).toEqual(1);

        modelFindById.restore();
        saveSpy.restore();
    });
});
