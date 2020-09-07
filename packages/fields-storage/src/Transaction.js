// @flow
import Batch from "./Batch";

class Transaction extends Batch {
    constructor(...operations) {
        super(...operations);
        this.type = "transaction";
    }

    async execute() {
        for (let i = 0; i < this.operations.length; i++) {
            const item = this.operations[i];
            if (Array.isArray(item)) {
                await this.operations[i][0]({ ...this.operations[i][1], batch: this });
            } else {
                await this.operations[i]({ batch: this });
            }
        }
        return this;
    }
}

export default Transaction;
