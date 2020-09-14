class BatchOperation {
    constructor(operation) {
        this.ready = false;
        this.skipStorageDriver = false;
        this.operation = operation;
    }
}

class Batch {
    constructor(...operations) {
        this.resolveReadyPromise = null;
        this.readyPromise = new Promise(resolve => {
            this.resolveReadyPromise = resolve;
        });

        this.type = "batch";
        this.id = Math.random()
            .toString(36)
            .slice(-6); // e.g. tfz58m

        this.meta = {};

        // Holds operations in special Batch operation objects
        this.operations = [];

        this.push(...operations);
    }

    allOperationsMarkedAsReady() {
        for (let i = 0; i < this.operations.length; i++) {
            let operation = this.operations[i];
            if (!operation.ready) {
                return false;
            }
        }
        return true;
    }

    getStorageDriverOperations() {
        return this.operations.filter(item => !item.skipStorageDriver);
    }

    markBatchAsReady() {
        this.readyPromise = true;
        this.resolveReadyPromise();
    }

    waitBatchReady() {
        return this.readyPromise;
    }

    push(...operations) {
        for (let i = 0; i < operations.length; i++) {
            let item = operations[i];
            this.operations.push(new BatchOperation(item));
        }
    }

    async execute() {
        const promises = [];
        for (let i = 0; i < this.operations.length; i++) {
            const [model, operation, args] = this.operations[i].operation;
            promises.push(
                model[operation]({
                    ...args,
                    __batch: {
                        instance: this,
                        operation: this.operations[i]
                    }
                })
            );
        }

        return await Promise.all(promises);
    }
}

export default Batch;
