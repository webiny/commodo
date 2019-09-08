import { withHooks } from "@commodo/hooks";
import { compose } from "ramda";
import { withProps } from "repropose";

test(`"hook1" must execute all of handlers, and then "hook2"`, async () => {
    const executedHooks = [];

    const TestModel1 = compose(
        withHooks({
            hook1() {
                executedHooks.push("T1");
                this.number = this.number + 0.33;
            },
            hook2() {
                executedHooks.push("T2");
                this.number = this.number + 0.33;
            }
        }),
        withProps({
            number: 0,
            async doSomething() {
                await this.hook("hook1");
                await this.hook("hook2");
                return this;
            }
        }),
        withHooks({
            hook1() {
                executedHooks.push("B1");

                this.number = this.number + 1;
            },
            hook2() {
                executedHooks.push("B2");
                this.number = this.number + 1;
            }
        })
    )();

    const testModel1 = new TestModel1();
    await testModel1.doSomething();
    expect(executedHooks).toEqual(["B1", "T1", "B2", "T2"]);
});
