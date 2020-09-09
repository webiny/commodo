class BatchProcess {
    constructor(batch, documentClient) {
        this.documentClient = documentClient;
        this.batchProcess = batch;

        this.queryBuildResolveFunction = null;
        this.queryBuilding = new Promise(resolve => {
            this.queryBuildResolveFunction = resolve;
        });

        this.resolveExecution = null;
        this.rejectExecution = null;
        this.queryExecution = new Promise((resolve, reject) => {
            this.resolveExecution = resolve;
            this.rejectExecution = reject;
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

    startExecution() {
        const batchWriteParams = {
            RequestItems: {}
        };

        let initialType;
        for (let i = 0; i < this.operations.length; i++) {
            let [type, { TableName, ...rest }] = this.operations[i];
            if (!initialType) {
                initialType = type;
            } else if (type !== initialType) {
                this.rejectExecution({
                    message: `Cannot batch operations - all operations must be of the same type (the initial operation type was "${initialType}", and operation type on index "${i}" is "${type}").`
                });
                return;
            }

            if (!batchWriteParams.RequestItems[TableName]) {
                batchWriteParams.RequestItems[TableName] = [];
            }

            batchWriteParams.RequestItems[TableName].push({
                [type]: rest
            });
        }

        this.documentClient
            .batchWrite(batchWriteParams)
            .promise()
            .catch(this.rejectExecution)
            .then(results => {
                this.results = results;
                this.resolveExecution();
            });
    }

    waitForOperationsAdded() {
        return this.queryBuilding;
    }

    waitForQueryExecution() {
        return this.queryExecution;
    }
}

export default BatchProcess;
