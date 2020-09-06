import { compose } from "ramda";
import camelcase from "camelcase";
import { withName } from "@commodo/name";
import { withHooks } from "@commodo/hooks";
import { withFields, string, boolean, number, fields } from "@commodo/fields";
import { withPrimaryKey, withUniqueKey } from "@commodo/fields-storage";

export default base =>
    compose(
        withName("SimpleModel"),
        withHooks({
            beforeSave() {
                if (this.name) {
                    this.slug = camelcase(this.name);
                }
            }
        }),
        withPrimaryKey("pk", "sk"),
        withFields({
            pk: string(),
            sk: string(),
            name: string(),
            slug: string(),
            enabled: boolean({ value: true }),
            tags: string({ list: true }),
            age: number()
        })
    )(base());

function somethingDoesntMatter() {
    const PageAData = compose(
        withName("PageAData"),
        withFields({
            tags: string({ list: true }),
            title: string()
        })
    )();
    const PageCategoryData = compose(
        withName("PageCategoryData"),
        withFields({
            categoryId: string({ list: true }),
            slug: string({ list: true })
        })
    )();
    // The main difference between the previous and DynamoDb approach is that models start NOT to represent
    // a single entity, but an item collection (at least this is the technique I went with here). So in this case here,
    // the base fields that all items in the collection are using are the PK, SK and GSI* fields, and the rest is
    // always written to the "data" field, which can contain a couple of different data models.
    const PageItem = compose(
        withName("Pages"),
        withPrimaryKey("PK", "SK"),
        withUniqueKey("GSI1_PK", "GSI1_SK"),
        withUniqueKey("GSI2_PK", "GSI2_SK"),
        withUniqueKey("GSI3_PK", "GSI3_SK"),
        withFields({
            PK: string(),
            SK: string(),
            GSI1_PK: string(),
            GS1_SK: string(),
            GSI2_PK: string(),
            GS2_SK: string(),
            GSI3_PK: string(),
            GSI3_SK: string(),
            // We use the same technique "ref" field has. We pass an array to the instanceOf property, and define
            // the field in which we write the actual model used. We used this with "ref" fields in a couple of places.
            // So, we'd just need to have this option here too.
            data: fields({
                instanceOf: [PageAData, PageCategoryData],
                refNameField: "dataModel"
            }),
            dataModel: string() // PageAData, PageCategoryData, PageTagData ...
        }),
        withIdentity(),
        withHooks({
            async afterSave() {
                // A check should be implemented here first, in order to determine which type of item we are saving.
                // The operations below are only specific for saving A records.
                // Once we save the A record, we can then save other items inside of a transaction or a batch operation.
                // Whatever fits the particular needs better...
                // const batch = new Batch();
                const transaction = new Transaction();
                const pageCategory = new PageItem();
                pageCategory.PK = this.id;
                pageCategory.SK = `Category`;
                pageCategory.GSI1_PK = `Page#${this.data.category}`;
                pageCategory.GSI1_SK = `savedOn#${new Date()}`;
                pageCategory.GSI3_PK = `Category#${this.data.category}`;
                pageCategory.GSI3_SK = `${new Date()}`;
                pageCategory.data = new PageCategoryData().populate({
                    category: "1",
                    slug: "static"
                });
                transaction.push(pageCategory.save);
                for (let i = 0; i < this.data.tags.length; i++) {
                    let tag = this.data.tags[i];
                    const pageTag = new PageItem().populate({
                        PK: this.id,
                        SK: `Tag#${tag}`,
                        GSI3_PK: `Tag#${tag}`,
                        GSI3_SK: new Date()
                    });
                    transaction.push(pageTag.save);
                }
                await transaction.send();
                // new Batch({});
            }
        })
    )(base());
    // Creating a new page. Maybe some of these could be sent to beforeSave hook... but we'll have to be careful, so that other classes don't execute the same logic.. For example when saving a new `Page#2 / Tag#universe` entry, which will use the same PageItem class, we probably don't want to execute some of the `beforeSave` stuff. A good example is the stuff that's above in the `afterSave` hook, those shouldn't be there, because we only want to trigger those on the A record save.
    const page = new PageItem();
    page.pk = "Page#1";
    page.sk = "A";
    page.GSI2_PK = "User#2";
    page.GSI2_SK = new Date();
    page.GSI3_PK = "Page";
    page.GSI3_SK = new Date();
    page.data = new PageAData().populate({
        category: "static",
        title: "Welcome to Webiny!",
        tags: ["science", "universe"]
    });
    return PageItem;
}
