import { withName, hasName } from "@commodo/name";
import { compose } from "ramda";

test(`"hasName" must return true or false accordingly`, async () => {
    const ModelWithName = compose(withName("TestModel1"))();
    const ModelWithoutName = function() {};
    expect(hasName(ModelWithName)).toBe(true);
    expect(hasName(ModelWithoutName)).toBe(false);
});

test(`based on given model name, "hasName" must return true or false accordingly`, async () => {
    const ModelWithName = compose(withName("TestModel1"))();
    const ModelWithoutName = function() {};
    expect(hasName(ModelWithName, "TestModel1")).toBe(true);
    expect(hasName(ModelWithName, "TestModel2")).toBe(false);
    expect(hasName(ModelWithoutName, "TestModel2")).toBe(false);
});
