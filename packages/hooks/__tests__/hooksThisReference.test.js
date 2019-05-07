import { withHooks } from "@commodo/hooks";
import { compose } from "ramda";
import { withProps } from "repropose";

test(`"this" used in hooks must be a correct reference`, async () => {
    const TestModel1 = compose(
        withHooks({
            hook1() {
                this.number = this.number + 0.33;
            },
            hook2() {
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
                console.log("B1");
                this.number = this.number + 1;
            },
            hook2() {
                console.log("B2");
                this.number = this.number + 1;
            }
        })
    )(function() {});

    const testModel1 = new TestModel1();
    console.log(testModel1.__hooks);
    await testModel1.doSomething();

    expect(testModel1.number).toBe(2.66);
});
