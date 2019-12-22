import { withHooks } from "@commodo/hooks";
import { compose } from "ramda";
import { withProps } from "repropose";

test(`hook callback must be removed after once execution`, async () => {
    const TestModel1 = compose(
        withProps({
            b: 0,
            async a(value) {
                await this.hook("onA", value);
            }
        }),
        withHooks()
    )();

    const testModel1 = new TestModel1();
    const removeCallback1 = testModel1.hook("onA", value => {
        testModel1.b += value;
        removeCallback1();
    });
    const removeCallback2 = testModel1.hook("onA", value => {
        testModel1.b += value * 2;
        removeCallback2();
    });

    expect(testModel1.b).toBe(0);
    expect(testModel1.__withHooks.onA.length).toBe(2);

    await testModel1.a(10);
    expect(testModel1.b).toBe(30);

    expect(testModel1.__withHooks.onA).toBe(undefined);

    await testModel1.a(10);
    expect(testModel1.b).toBe(30);

    await testModel1.a(10);
    expect(testModel1.b).toBe(30);

    await testModel1.a(10);
    expect(testModel1.b).toBe(30);
});
