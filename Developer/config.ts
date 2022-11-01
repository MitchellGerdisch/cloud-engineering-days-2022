import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

// Construct a base name for naming convention purposes.
export let nameBase = config.get("nameBase") ?? `${pulumi.getProject()}-${pulumi.getStack()}`;

