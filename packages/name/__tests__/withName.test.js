import { withName } from "@commodo/name";
import { compose } from "ramda";

test(`"withName" must assign name and it must be obtainable via "getName" method`, async () => {
    const TestModel1 = compose(withName("TestModel1"))();
    expect(TestModel1.__withName).toBe("TestModel1");

    const TestModel2 = compose(withName("TestModel2"))();
    expect(TestModel2.__withName).toBe("TestModel2");
});
