import useModels from "./models/useModels";
import createSimpleModelsMock from "./mocks/createSimpleModelsMock";
import mdbid from "mdbid";
import mongodb from "mongodb";

describe("populateFromStorage test", function() {
    const { models, getCollection } = useModels();
    const { simpleModelsMock, ids } = createSimpleModelsMock();
    let complexModelId;

    beforeAll(async () => {
        complexModelId = mdbid();

        await getCollection("ComplexModel").insertOne({
            _id: new mongodb.ObjectID(complexModelId),
            id: complexModelId,
            firstName: "test",
            lastName: "tester",
            verification: { verified: true, documentType: "driversLicense" },
            tags: [
                { slug: "no-name", label: "No Name" },
                { slug: "adult-user", label: "Adult User" }
            ],
            simpleModel: String(ids[0]),
            simpleModels: [String(ids[1]), String(ids[2]), String(ids[3])]
        });

        await getCollection("RefModel").insertOne(simpleModelsMock[0]);

        await getCollection("RefModel").insertMany(
            simpleModelsMock.slice(1).map(({ _id, id, name }) => ({
                _id,
                id,
                name,
                complexModel: complexModelId
            }))
        );
    });

    it("should populate model correctly with data received from MongoDb", async () => {
        const user = await models.ComplexModel.findOne({ query: { id: complexModelId } });
        expect(user.firstName).toBe("test");
        expect(user.lastName).toBe("tester");
        expect(user.verification.verified).toBe(true);
        expect(user.verification.documentType).toBe("driversLicense");
        expect(user.tags[0].slug).toBe("no-name");
        expect(user.tags[0].label).toBe("No Name");
        expect(user.tags[1].slug).toBe("adult-user");
        expect(user.tags[1].label).toBe("Adult User");
        expect(user.tags.length).toBe(2);
    });
});
