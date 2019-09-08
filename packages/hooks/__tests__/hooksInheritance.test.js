import { withHooks } from "@commodo/hooks";
import { compose } from "ramda";
import { withProps } from "repropose";

test(`applying additional hooks MUST ALSO (unfortunately) apply them also to the base function`, async () => {
    let count = 0;

    const TestModel1 = compose(
        withProps({}),
        withHooks({
            hook1() {
                count++;
            }
        })
    )();

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

    expect(Object.keys(testModel1.__hooks)).toEqual(["hook1", "hook2"]);
    expect(Object.keys(testModel2.__hooks)).toEqual(["hook1", "hook2"]);
});

test(`applying extracted hooks MUST NOT apply them also to the base function`, async () => {
    let count = 0;

    const setOfProps1 = base =>
        compose(
            withProps({}),
            withHooks({
                hook1() {
                    count++;
                }
            })
        )(base);

    const setOfProps2 = base =>
        compose(
            withProps({}),
            withHooks({
                hook2() {
                    count++;
                }
            })
        )(base);

    const TestModel1 = setOfProps1();
    const TestModel2 = compose(
        setOfProps2,
        setOfProps1
    )();

    const testModel1 = new TestModel1();
    const testModel2 = new TestModel2();

    expect(Object.keys(testModel1.__hooks)).toEqual(["hook1"]);
    expect(Object.keys(testModel2.__hooks)).toEqual(["hook1", "hook2"]);
});
