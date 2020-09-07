class Batch {
    constructor(...operations) {
        this.operations = operations;
        this.type = "batch";
        this.id = Math.random()
            .toString(36)
            .slice(-6); // e.g. tfz58m
    }

    push(...items) {
        this.operations.push(...items);
    }

    async execute() {
        const promises = [];
        for (let i = 0; i < this.operations.length; i++) {
            const [model, operation, args] = this.operations[i];
            promises.push(model[operation]({ ...args, batch: this }));
        }

        await Promise.all(promises);

        return this;
    }
}

export default Batch;
