import useModels from "./models/useModels";

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
    });
});
