import { withHooks } from "@commodo/hooks";
import { withProps } from "repropose";
import { compose } from "ramda";

test(`"withHooks" must assign hooks correctly`, async () => {
    let counts = {
        beforeSave: 0,
        save: 0,
        afterSave: 0
    };

    const TestModel = compose(
        withHooks({
            save() {
                ++counts.save;
                this.internalCounts.save += 10;
            }
        }),
        withHooks({
            beforeSave() {
                --counts.beforeSave;
                --this.internalCounts.beforeSave;
            },
            save() {
                --counts.save;
                --this.internalCounts.save;
            },
            afterSave() {
                --counts.afterSave;
                --this.internalCounts.afterSave;
            }
        }),
        withProps(() => ({
            internalCounts: {
                beforeSave: 0,
                save: 0,
                afterSave: 0
            },
            async save() {
                await this.triggerHook("beforeSave");
                await this.triggerHook("save");
                // Here we would do: await instance.save();
                await this.triggerHook("afterSave");

                // Just testing inline "afterSave" hook registration.
                this.onHook("afterSave", () => {
                    counts.beforeSave++;
                    ++this.internalCounts.beforeSave;
                });

                this.onHook("afterSave", () => {
                    counts.beforeSave--;
                    --this.internalCounts.beforeSave;
                });
            }
        })),
        withHooks({
            beforeSave() {
                ++counts.beforeSave;
                ++this.internalCounts.beforeSave;
            },
            save() {
                ++counts.save;
                ++this.internalCounts.save;
            },
            afterSave() {
                ++counts.afterSave;
                ++this.internalCounts.afterSave;
            }
        })
    )(function() {});

    const testModel = new TestModel();
    await testModel.save();
    await testModel.save();
    await testModel.save();

    expect(counts).toEqual({
        beforeSave: 0,
        save: 3,
        afterSave: 0
    });

    expect(testModel.internalCounts).toEqual({
        beforeSave: 0,
        save: 30,
        afterSave: 0
    });
});

test(`"withHooks" must not do anything if no hooks were passed`, async () => {
    const TestModel = compose(
        withHooks(),
        withHooks()
    )(function() {});

    const model = new TestModel();
    expect(model.__hooks).toEqual({});
});

test(`thrown errors`, async () => {
    const TestModel = compose(
        withHooks({
            xyz: () => {
                throw Error("Thrown.");
            }
        })
    )(function() {});

    const model = new TestModel();

    try {
        await model.triggerHook('xyz');
    } catch (e) {
        return;
    }

    throw Error(`Error should've been thrown.`);
});
