module.exports = {
    tables: [
        {
            TableName: `pk-sk`,
            KeySchema: [
                { AttributeName: "pk", KeyType: "HASH" },
                { AttributeName: "sk", KeyType: "RANGE" }
            ],
            AttributeDefinitions: [
                { AttributeName: "pk", AttributeType: "S" },
                { AttributeName: "sk", AttributeType: "S" },
                { AttributeName: "gsi1pk", AttributeType: "S" },
                { AttributeName: "gsi1sk", AttributeType: "S" },
                { AttributeName: "gsi2pk", AttributeType: "S" },
                { AttributeName: "gsi2sk", AttributeType: "S" }
            ],
            ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
            GlobalSecondaryIndexes: [
                {
                    IndexName: "gsi1pk_gsi1sk",
                    KeySchema: [
                        { AttributeName: "gsi1pk", KeyType: "HASH" },
                        { AttributeName: "gsi1sk", KeyType: "RANGE" }
                    ],
                    Projection: {
                        ProjectionType: "ALL"
                    },
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 1,
                        WriteCapacityUnits: 1
                    }
                },
                {
                    IndexName: "gsi2pk_gsi2sk",
                    KeySchema: [
                        { AttributeName: "gsi2pk", KeyType: "HASH" },
                        { AttributeName: "gsi2sk", KeyType: "RANGE" }
                    ],
                    Projection: {
                        ProjectionType: "ALL"
                    },
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 1,
                        WriteCapacityUnits: 1
                    }
                }
            ]
        }
    ]
};
