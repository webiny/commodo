import { User, Company } from "../../resources/models/userCompanyImage";
import { One } from "../../resources/models/oneTwoThree";
import { ClassA } from "../../resources/models/abc";
import { ClassADynamic } from "../../resources/models/abcDynamicAttribute";
import sinon from "sinon";

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
            .stub(user.getStorageDriver(), "save")
            .onCall(0)
            .callsFake(({ model }) => {
                model.id = "AA";
                return true;
            })
            .onCall(1)
            .callsFake(({ model }) => {
                model.id = "BB";
                return true;
            })
            .onCall(2)
            .callsFake(({ model }) => {
                model.id = "CC";
                return true;
            });

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
        let findById = sandbox
            .stub(One.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: "one", name: "One", two: "two" };
            })
            .onCall(1)
            .callsFake(() => {
                return { id: "two", name: "Two", three: "three" };
            })
            .onCall(2)
            .callsFake(() => {
                return {
                    id: "three",
                    name: "Three",
                    four: "four",
                    anotherFour: "anotherFour",
                    five: "five",
                    six: "six"
                };
            })
            .onCall(3)
            .callsFake(() => {
                return { id: "four", name: "Four" };
            })
            .onCall(4)
            .callsFake(() => {
                return { id: "anotherFour", name: "Another Four" };
            })
            .onCall(5)
            .callsFake(() => {
                return { id: "five", name: "Five" };
            })
            .onCall(6)
            .callsFake(() => {
                return { id: "six", name: "Six" };
            });

        const one = await One.findById("one");

        let modelDelete = sandbox.stub(one.getStorageDriver(), "delete");
        await one.delete();

        expect(modelDelete.callCount).toEqual(7);

        findById.restore();
        modelDelete.restore();
    });

    test("should not delete linked models if main model is deleted and auto delete is not enabled", async () => {
        const modelFindById = sandbox
            .stub(ClassA.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: "classA", name: "ClassA" };
            });

        const classA = await ClassA.findById("classA");
        modelFindById.restore();

        classA.classB = { name: "classB", classC: { name: "classC" } };

        const modelSave = sandbox
            .stub(classA.getStorageDriver(), "save")
            .onCall(0)
            .callsFake(({ model }) => {
                model.id = "classC";
                return true;
            })
            .onCall(1)
            .callsFake(({ model }) => {
                model.id = "classB";
                return true;
            })
            .onCall(2)
            .callsFake(() => {
                return true;
            });

        await classA.save();
        modelSave.restore();

        expect(modelSave.calledThrice).toBeTruthy();

        expect(classA.id).toBe("classA");

        const classB = await classA.classB;
        expect(classB.id).toBe("classB");

        const classC = await classB.classC;
        expect(classC.id).toBe("classC");

        expect(await classA.getField("classB").getStorageValue()).toBe("classB");
        expect(await classB.getField("classC").getStorageValue()).toBe("classC");

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
        const modelFindById = sandbox
            .stub(ClassADynamic.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: "classADynamic", name: "ClassADynamic" };
            });

        const classADynamic = await ClassADynamic.findById("classADynamic");
        modelFindById.restore();

        const modelSave = sandbox
            .stub(classADynamic.getStorageDriver(), "save")
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
