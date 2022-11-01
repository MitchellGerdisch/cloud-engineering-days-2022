import * as pulumi from "@pulumi/pulumi";

import { Frontend } from "../components/frontend";
import { tagAllResources } from "../components/tagger";

const org = pulumi.getOrganization();
const project = pulumi.getProject();
const stack = pulumi.getStack();
const config = new pulumi.Config();
const nameBase = config.get("nameBase") ?? `${project}-${stack}`;
const appName = config.require("appName"); 
const backendProject = config.require("backendProject");
const backendStackRef = new pulumi.StackReference(`${org}/${backendProject}/${stack}`);
const busArn = backendStackRef.requireOutput("busArn");

tagAllResources({"project": nameBase})

// const frontend = busArn.apply(arn => new Frontend(nameBase, {busArn: arn, appName: appName}));
const frontend = new Frontend(nameBase, {busArn: busArn, appName: appName});

// The Frontend URL to hit that causes events
export const apiUrl = frontend.url;