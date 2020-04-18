import find from '../../../fields-storage-mongodb/__tests__/database/findCursorMock';

function mockFunction() {
    return {
        promise: function() {
            return {}
        }
    }
}

export default {
        put: mockFunction,
        query: mockFunction,
        update: mockFunction,
        delete: mockFunction,
        get: mockFunction,
        scan: mockFunction,



    // TODO: remove and replace by dynamoDb methods
    find: () => find,
    findOne: () => {},
    deleteOne: () => {},
    countDocuments: () => {},
    updateOne: () => {},
    insertOne: () => {},
    aggregate: () => find
};
