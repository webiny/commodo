import { withFields, setOnce, string, fields } from "@commodo/fields";
import createModel from "./resources/models/createModel";

import { compose } from "ramda";

describe("toStorage test", () => {
    test("should populate the model with data from storage correctly", async () => {
        const SomeModel = compose(
            withFields({
                slug: setOnce()(string()),
                name: string(),
                description: string(),
                moreFields: fields({
                    instanceOf: withFields({
                        type: string(),
                        category: string(),
                        objectsList: fields({
                            list: true,
                            instanceOf: withFields({
                                name: string(),
                                slug: string()
                            })()
                        })
                    })()
                })
            })
        )(createModel());

        const someModel1 = new SomeModel();
        await someModel1.populateFromStorage({
            slug: "slug-test",
            name: "name-test",
            description: "description-test",
            moreFields: {
                type: "type-test",
                category: "category-test",
                objectsList: [
                    { name: "objects-name-test-1", slug: "objects-slug-test-1" },
                    { name: "objects-name-test-2", slug: "objects-slug-test-2" }
                ]
            }
        });

        expect(someModel1.getField("slug").current).toBe("slug-test");
        expect(someModel1.getField("slug").state.set).toBe(true);

        expect(someModel1.getField("name").current).toBe("name-test");
        expect(someModel1.getField("name").state.set).toBe(true);

        expect(someModel1.getField("description").current).toBe("description-test");
        expect(someModel1.getField("description").state.set).toBe(true);

        expect(someModel1.moreFields.getField("type").current).toBe("type-test");
        expect(someModel1.moreFields.getField("type").state.set).toBe(true);

        expect(someModel1.moreFields.getField("category").current).toBe("category-test");
        expect(someModel1.moreFields.getField("category").state.set).toBe(true);

        const objectsListField = someModel1.moreFields.getField("objectsList");
        expect(objectsListField.state.set).toBe(true);
        expect(objectsListField.current[0].name).toBe("objects-name-test-1");
        expect(objectsListField.current[0].slug).toBe("objects-slug-test-1");
        expect(objectsListField.current[0].getField("name").state.set).toBe(true);
        expect(objectsListField.current[0].getField("slug").state.set).toBe(true);

        expect(objectsListField.current[1].name).toBe("objects-name-test-2");
        expect(objectsListField.current[1].slug).toBe("objects-slug-test-2");
        expect(objectsListField.current[1].getField("name").state.set).toBe(true);
        expect(objectsListField.current[1].getField("slug").state.set).toBe(true);

        // Check if null values are handled correctly.
        const someModel2 = new SomeModel();
        await someModel2.populateFromStorage({
            // slug: null, --- let's say storage layer did not return this key at all.
            // name: null, --- let's say storage layer did not return this key at all.
            description: null,
            moreFields: null
        });

        expect(someModel2.getField("slug").current).toBe(null);
        expect(someModel2.getField("slug").state.set).toBe(false); // Should this be false? Leave it for now.

        expect(someModel2.getField("name").current).toBe(null);
        expect(someModel2.getField("name").state.set).toBe(false); // Should this be false? Leave it for now.

        expect(someModel2.getField("description").current).toBe(null);
        expect(someModel2.getField("description").state.set).toBe(true);

        expect(someModel2.getField("moreFields").current).toBe(null);
        expect(someModel2.getField("moreFields").state.set).toBe(true);


        const someModel3 = new SomeModel();
        await someModel3.populateFromStorage({
            moreFields: {
                type: 'something',
                objectsList: null
            }
        });

        expect(someModel3.getField("slug").current).toBe(null);
        expect(someModel3.getField("slug").state.set).toBe(false); // Should this be false? Leave it for now.

        expect(someModel3.getField("moreFields").current.type).toBe('something');
        expect(someModel3.getField("moreFields").current.getField('type').state.set).toBe(true);

        expect(someModel3.getField("moreFields").current.getField('objectsList').state.set).toBe(true);
        expect(someModel3.getField("moreFields").current.getField('objectsList').current).toBe(null);

    });
});
