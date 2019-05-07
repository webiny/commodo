import { withHooks } from "@commodo/hooks";
import { compose } from "ramda";
import { withProps } from "repropose";

test(`applying additional hooks must not apply them also to the base function`, async () => {
    let count = 0;

    const TestModel1 = compose(
        withProps({}),
        withHooks({
            hook1() {
                count++;
            }
        })
    )(function() {});

    const TestModel2 = compose(
        withProps({}),
        withHooks({
            hook2() {
                count++;
            }
        })
    )(TestModel1);

    const testModel1 = new TestModel1();
    const testModel2 = new TestModel2();

    expect(Object.keys(testModel1.__hooks)).toEqual(["hook1"]);
    expect(Object.keys(testModel2.__hooks)).toEqual(["hook1", "hook2"]);
});
