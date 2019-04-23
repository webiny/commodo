import {
    Main,
    MainMissingRefNameField,
    MainMissingRefNameFieldOption,
    A,
    B,
    C,
    InvalidEntityClass
} from "../../resources/models/multipleClassesModels";
import sinon from "sinon";
import {WithFieldsError} from "@commodo/fields";

const sandbox = sinon.createSandbox();

describe("multiple Entity classes test", () => {
    afterEach(() => sandbox.restore());
    beforeEach(() => Main.getStoragePool().flush());

    test("should assign different Entity class instances and assign the classId to specified attribute", async () => {
        const main = new Main();

        main.assignedTo = new A().populate({ name: "a" });
        expect(main.assignedToRefName).toBe("A");
        expect((await main.assignedTo).name).toBe("a");

        main.assignedTo = new B().populate({ name: "b" });
        expect(main.assignedToRefName).toBe("B");
        expect((await main.assignedTo).name).toBe("b");

        main.assignedTo = new C().populate({ name: "c" });
        expect(main.assignedToRefName).toBe("C");
        expect((await main.assignedTo).name).toBe("c");
    });

    test("must throw an error on validation because an invalid class was passed", async () => {
        const main = new Main();


        try {
            main.assignedTo = new InvalidEntityClass();
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
            expect(e.message).toEqual('Invalid data type: ref field "assignedTo" cannot accept value [object Object].');
            return;
        }
        throw Error(`Error should've been thrown.`);
    });

    test("must throw an error since 'refNameField' option is missing", async () => {
        const main = new MainMissingRefNameFieldOption();
        main.assignedTo = new A().populate({ name: "a" });

        try {
            await main.validate();
        } catch (e) {
            expect(e).toBeInstanceOf(WithFieldsError);
            expect(e.code).toEqual(WithFieldsError.VALIDATION_FAILED_INVALID_FIELDS);
            expect(e.data).toEqual({
                invalidFields: {
                    assignedTo: {
                        code: "VALIDATION_FAILED_INVALID_FIELD",
                        data: null,
                        message:
                            'Entity field "assignedTo" accepts multiple Entity classes but does not have "refNameField" option defined.'
                    }
                }
            });
            return;
        }

        throw Error(`Error should've been thrown.`);
    });

    test("must throw an error since classId attribute is missing", async () => {
        const main = new MainMissingRefNameField();
        main.assignedTo =  new A().populate({ name: "a" });

        try {
            await main.validate();
        } catch (e) {
            expect(e).toBeInstanceOf(WithFieldsError);
            expect(e.code).toEqual(WithFieldsError.VALIDATION_FAILED_INVALID_FIELDS);
            expect(e.data).toEqual({
                invalidFields: {
                    assignedTo: {
                        code: "VALIDATION_FAILED_INVALID_FIELD",
                        data: null,
                        message:
                            'Entity field "assignedTo" accepts multiple Entity classes but classId field is missing.'
                    }
                }
            });
            return;
        }

        throw Error(`Error should've been thrown.`);
    });

    test("must be able to set null as value", async () => {
        const main = new Main();
        main.assignedTo = new A().populate({ name: "a" });
        expect(main.assignedToRefName).toEqual("A");
        expect((await main.assignedTo).name).toEqual("a");

        main.assignedTo = null;
        expect(main.assignedToRefName).toEqual(null);
        expect(await main.assignedTo).toBeNull();

        // Should not throw error.
        await main.validate();
    });
});
