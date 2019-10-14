import { MainEntity } from "../../resources/models/modelsAttributeModels";
import sinon from "sinon";
import { withFields, string } from "@commodo/fields";
import { withName } from "@commodo/name";
import { ref } from "@commodo/fields-storage-ref";
import { compose } from "ramda";
import createModel from "./../../resources/models/createModel";

const sandbox = sinon.createSandbox();

describe("assign array with plain objects test", () => {
    afterEach(() => sandbox.restore());
    beforeEach(() => MainEntity.getStoragePool().flush());

    test("an array with plain objects must be accepted", async () => {
        const SecurityRole = compose(
            withFields({
                name: string()
            }),
            withName("SecurityRole")
        )(createModel());

        const SecurityRoles2Models = compose(
            withFields(() => ({
                entity: ref({ instanceOf: [], refNameField: "entityClassId" }),
                entityClassId: string(),
                role: ref({
                    instanceOf: SecurityRole
                })
            })),
            withName("SecurityRoles2Models")
        )(createModel());

        const SecurityGroup = compose(
            withFields(() => ({
                roles: ref({
                    list: true,
                    instanceOf: [SecurityRole, "entity"],
                    using: [SecurityRoles2Models, "role"]
                })
            })),
            withName("SecurityGroup")
        )(createModel());

        const roles = [{ name: "role-1" }, { name: "role-2" }, { name: "role-3" }];

        const securityGroup = new SecurityGroup();
        securityGroup.populate({ roles });
        await securityGroup.save();

        const securityGroupRoles = await securityGroup.roles;

        expect(securityGroupRoles.length).toBe(3);
        expect(securityGroupRoles[0].name).toBe("role-1");
        expect(securityGroupRoles[1].name).toBe("role-2");
        expect(securityGroupRoles[2].name).toBe("role-3");
        expect(typeof securityGroupRoles[0].id === 'string').toBe(true);
        expect(typeof securityGroupRoles[1].id === 'string').toBe(true);
        expect(typeof securityGroupRoles[2].id === 'string').toBe(true);
    });
});
