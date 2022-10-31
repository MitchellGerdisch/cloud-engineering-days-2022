import * as pulumi from "@pulumi/pulumi";

// Build a base name for naming conventions
export const nameBase= `${pulumi.getProject()}-${pulumi.getStack()}`