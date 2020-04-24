import useModels from "../utils/useModels";
import createSimpleModelsMock from "../mocks/createSimpleModelsMock";
import mdbid from "mdbid";
import mongodb from "mongodb";

describe("populateFromStorage test", function() {
    const { models, getDynamoDB } = useModels();
    const { simpleModelsMock, ids } = createSimpleModelsMock();
    let complexModelId;
    let ddb;

    beforeAll(async () => {
        complexModelId = mdbid();
        ddb = getDynamoDB();

        await ddb.put({
            TableName: 'ComplexModel',
            Item: {
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
            },
        }).promise();

        await ddb.put({
            TableName: 'RefModel',
            Item: simpleModelsMock[0],
        }).promise();

        const promises = simpleModelsMock.slice(1).map(({ _id, id, name }) => ({
            _id,
            id,
            name,
            complexModel: complexModelId
        })).map(model => ddb.put({ TableName: 'RefModel', Item: model }).promise());
        await Promise.all(promises);
    });

    it("should populate model correctly with data received from MongoDb", async () => {
        let user = new models.ComplexModel();
        expect(user.getField("simpleModel").state.loading).toBe(false);
        expect(user.getField("simpleModel").state.loaded).toBe(false);

        user = await models.ComplexModel.findById(complexModelId);
        expect(user.getField("simpleModel").state.loading).toBe(false);
        expect(user.getField("simpleModel").state.loaded).toBe(false);
        expect(user.firstName).toBe("test");
        expect(user.lastName).toBe("tester");
        expect(user.verification.verified).toBe(true);
        expect(user.verification.documentType).toBe("driversLicense");
        expect(user.tags[0].slug).toBe("no-name");
        expect(user.tags[0].label).toBe("No Name");
        expect(user.tags[1].slug).toBe("adult-user");
        expect(user.tags[1].label).toBe("Adult User");
        expect(user.tags.length).toBe(2);

        expect(user.getField("simpleModel").current).toBe(String(ids[0]));

        const simpleModel = await user.simpleModel;
        expect(simpleModel.id).toBe(String(ids[0]));
        expect(simpleModel.name).toBe("Amazon Web Services");

        expect((await user.simpleModels).length).toBe(5);

        // Default sort is always `newest to oldest` records
        const simpleModels = await user.simpleModels;
        expect(simpleModels[2] instanceof models.RefModel).toBe(true);
        expect(simpleModels[2].id).toBe(String(ids[1]));
        expect(simpleModels[2].name).toBe("Serverless Database");

        expect(simpleModels[1] instanceof models.RefModel).toBe(true);
        expect(simpleModels[1].id).toBe(String(ids[2]));
        expect(simpleModels[1].name).toBe("Lambda");

        expect(simpleModels[0] instanceof models.RefModel).toBe(true);
        expect(simpleModels[0].id).toBe(String(ids[3]));
        expect(simpleModels[0].name).toBe("Cloud Infrastructure");
    });
});
