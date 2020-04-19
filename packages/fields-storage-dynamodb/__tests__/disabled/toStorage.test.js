import useModels from "./utils/useModels";

describe("toStorage test", function() {
    const { models } = useModels();

    it("should correctly adapt the data for MongoDB", async () => {
        const complexModel = new models.ComplexModel();
        complexModel.populate({
            firstName: "test",
            lastName: "tester",
            verification: {
                verified: true,
                documentType: "driversLicense"
            },
            tags: [
                { slug: "no-name", label: "No Name" },
                { slug: "adult-user", label: "Adult User" }
            ]
        });

        const simpleModel1 = new models.RefModel();
        simpleModel1.id = "000000000000000000000001";
        simpleModel1.name = "Test-1";

        complexModel.simpleModel = simpleModel1;

        const simpleModel2 = new models.RefModel();
        simpleModel2.id = "54759eb3c090d83494e2d804";
        simpleModel2.name = "Test-2";

        const simpleModel3 = new models.RefModel();
        simpleModel3.id = "54759eb3c090d83494e2d805";
        simpleModel3.name = "Test-3";

        const simpleModel4 = new models.RefModel();
        simpleModel4.id = "54759eb3c090d83494e2d806";
        simpleModel4.name = "Test-4";

        complexModel.simpleModels = [simpleModel2, simpleModel3, simpleModel4];

        const userObjectValue = await complexModel.toStorage();

        expect(userObjectValue.firstName).toBe("test");
        expect(userObjectValue.lastName).toBe("tester");
        expect(userObjectValue.verification).toEqual({
            verified: true,
            documentType: "driversLicense"
        });

        expect(userObjectValue.tags).toEqual([
            { slug: "no-name", label: "No Name" },
            { slug: "adult-user", label: "Adult User" }
        ]);

        expect(userObjectValue.simpleModel).toEqual("000000000000000000000001");
    });
});
