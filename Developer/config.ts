import * as pulumi from "@pulumi/pulumi";

// Construct a base name for naming convention purposes.
export const nameBase = `${pulumi.getProject()}-${pulumi.getStack()}`