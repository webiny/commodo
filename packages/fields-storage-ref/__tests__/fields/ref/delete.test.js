import { User, Company } from "../../resources/models/userCompanyImage";
import { One } from "../../resources/models/oneTwoThree";
import { ClassA } from "../../resources/models/abc";
import { ClassADynamic } from "../../resources/models/abcDynamicAttribute";
import sinon from "sinon";
import idGenerator from "@commodo/fields-storage/idGenerator";
import mdbid from "mdbid";
const sandbox = sinon.createSandbox();

describe("model delete test", () => {
    afterEach(() => sandbox.restore());

    test("auto delete must be manually enabled and canDelete must stop deletion if error was thrown", async () => {
        const user = new User();
        user.populate({
            firstName: "John",
            lastName: "Doe",
            markedAsCannotDelete: true,
            company: {
                name: "Company",
                markedAsCannotDelete: true,
                image: {
                    filename: "test.jpg",
                    size: 123.45,
                    markedAsCannotDelete: true
                }
            }
        });

        let modelSave = sandbox
            .stub(idGenerator, "generate")
            .onCall(0)
            .callsFake(() => "AA")
            .onCall(1)
            .callsFake(() => "BB")
            .onCall(2)
            .callsFake(() => "CC");

        await user.save();
        modelSave.restore();

        let error = null;

        let modelDelete = sandbox.stub(user.getStorageDriver(), "delete");
        try {
            await user.delete();
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual("Cannot delete Image model.");
        expect(modelDelete.notCalled).toBeTruthy();

        const company = await user.company;
        (await company.image).markedAsCannotDelete = false;

        try {
            await user.delete();
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual("Cannot delete Company model.");
        expect(modelDelete.notCalled).toBeTruthy();

        company.markedAsCannotDelete = false;

        try {
            await user.delete();
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual("Cannot delete User model.");
        expect(modelDelete.notCalled).toBeTruthy();

        user.markedAsCannotDelete = false;

        await user.delete();

        modelDelete.restore();
        expect(modelDelete.calledThrice).toBeTruthy();
    });

    test("should properly delete linked model even though they are not loaded (auto delete enabled)", async () => {
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

        let modelDelete = sandbox.stub(one.getStorageDriver(), "delete");
        await one.delete();

        expect(modelDelete.callCount).toEqual(7);

        findById.restore();
        modelDelete.restore();
    });

    test("should not delete linked models if main model is deleted and auto delete is not enabled", async () => {
        const ids = {
            classA: mdbid(),
            classB: mdbid(),
            classC: mdbid()
        };

        const modelFindById = sandbox
            .stub(ClassA.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: ids.classA, name: "ClassA" };
            });

        const classA = await ClassA.findById(ids.classA);
        modelFindById.restore();

        classA.classB = { name: "classB", classC: { name: "classC" } };

        const createSpy = sandbox.stub(classA.getStorageDriver(), "create");
        const updateSpy = sandbox.stub(classA.getStorageDriver(), "update");
        const generateIdStub = sandbox
            .stub(idGenerator, "generate")
            .onCall(0)
            .callsFake(() => ids.classC)
            .onCall(1)
            .callsFake(() => ids.classB);

        await classA.save();
        updateSpy.restore();
        generateIdStub.restore();

        expect(createSpy.callCount).toBe(2);
        expect(updateSpy.callCount).toBe(1);

        expect(classA.id).toBe(ids.classA);

        const classB = await classA.classB;
        expect(classB.id).toBe(ids.classB);

        const classC = await classB.classC;
        expect(classC.id).toBe(ids.classC);

        expect(await classA.getField("classB").getStorageValue()).toBe(ids.classB);
        expect(await classB.getField("classC").getStorageValue()).toBe(ids.classC);

        const modelDelete = sandbox
            .stub(ClassA.getStorageDriver(), "delete")
            .onCall(0)
            .callsFake(() => {
                return true;
            });

        await classA.delete();
        expect(modelDelete.calledOnce).toBeTruthy();

        modelDelete.restore();
    });

    test("should not attempt to delete linked models if attribute is set as dynamic", async () => {
        const ids = { classADynamic: mdbid() };
        const modelFindById = sandbox
            .stub(ClassADynamic.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: ids.classADynamic, name: "ClassADynamic" };
            });

        const classADynamic = await ClassADynamic.findById(ids.classADynamic);
        modelFindById.restore();

        const modelSave = sandbox
            .stub(classADynamic.getStorageDriver(), "update")
            .onCall(0)
            .callsFake(() => {
                return true;
            })
            .onCall(1)
            .callsFake(() => {
                return true;
            });

        await classADynamic.save();
        expect(modelSave.callCount).toBe(0);

        classADynamic.name = "now it should save because of this dirty attribute";
        await classADynamic.save();

        await classADynamic.save();
        modelSave.restore();
        expect(modelSave.callCount).toBe(1);

        const modelDelete = sandbox
            .stub(ClassADynamic.getStorageDriver(), "delete")
            .onCall(0)
            .callsFake(() => {
                return true;
            });

        await classADynamic.delete();
        expect(modelSave.callCount).toBe(1);

        modelDelete.restore();
    });
});
