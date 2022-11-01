import * as pulumi from "@pulumi/pulumi";
import "mocha";

pulumi.runtime.setMocks({
    newResource: function(args: pulumi.runtime.MockResourceArgs): {id: string, state: any} {
        return {
            id: args.inputs.name + "_id",
            state: args.inputs,
        };
    },
    call: function(args: pulumi.runtime.MockCallArgs) {
        return args.inputs;
    },
},
  "project",
  "stack",
  false, // Sets the flag `dryRun`, which indicates if pulumi is running in preview mode.
);


describe("Infrastructure", function() {
    let infra: typeof import("./backendTest");

    before(async function() {
        // It's important to import the program _after_ the mocks are defined.
        infra = await import("./backendTest");
    })

    describe("#bus", function() {
        // check 1: Instances have a Name tag.
        it("must have a name tag", function(done) {
            pulumi.all([infra.bus.arn]).apply(([arn]) => {
                if (!arn) {
                    done(new Error(`Missing a arn ${arn}`));
                } else {
                    done();
                }
            });
        });
    });
});