class BatchProcess {
    constructor(batch, documentClient) {
        this.documentClient = documentClient;
        this.batchProcess = batch;

        this.queryBuildResolveFunction = null;
        this.queryBuilding = new Promise(resolve => {
            this.queryBuildResolveFunction = resolve;
        });

        this.queryExecutionResolveFunction = null;
        this.queryExecution = new Promise(resolve => {
            this.queryExecutionResolveFunction = resolve;
        });

        this.operations = [];
        this.results = [];
    }

    addOperation(type, operation) {
        this.operations.push([type, operation]);
        return this.operations.length - 1;
    }

    allOperationsAdded() {
        return this.operations.length === this.batchProcess.operations.length;
    }

    markAsReady() {
        this.queryBuildResolveFunction();
    }

    async execute() {
        const batchWriteParams = {
            RequestItems: {}
        };

        for (let i = 0; i < this.operations.length; i++) {
            let [type, params] = this.operations[i];

            if (!batchWriteParams.RequestItems[params.TableName]) {
                batchWriteParams.RequestItems[params.TableName] = [];
            }

            batchWriteParams.RequestItems[params.TableName].push({
                [type]: {
                    Item: params.Item
                }
            });
        }

        this.results = await this.documentClient.batchWrite(batchWriteParams).promise();
        this.queryExecutionResolveFunction();
        return [];
    }

    waitForOperationsAdded() {
        return this.queryBuilding;
    }

    waitForQueryExecution() {
        return this.queryExecution;
    }
}

export default BatchProcess;
