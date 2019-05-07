import { withHooks } from "@commodo/hooks";
import { compose } from "ramda";
import { withProps } from "repropose";

test(`"this" used in hooks must be a correct reference`, async () => {
    const TestModel1 = compose(
        withProps({
            number2: 100,
            async doSomething() {
                await this.hook("hook1");
                await this.hook("hook2");
                return this;
            }
        }),
        withHooks({
            hook1() {
                this.number = this.number + 33;
                this.number2 = this.number2 + 20;
            },
            hook2() {
                this.number = this.number + 33;
                this.number2 = this.number2 + 20;
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
                this.number = this.number + 10;
                this.number2 = this.number2 + 25;
            },
            hook2() {
                this.number = this.number + 10;
                this.number2 = this.number2 + 25;
            }
        })
    )(function() {});

    const testModel1 = new TestModel1();
    await testModel1.doSomething();

    expect(testModel1.number).toBe(86);
    expect(testModel1.number2).toBe(190);
});
