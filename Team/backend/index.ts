import * as pulumi from "@pulumi/pulumi";
import * as pulumiService from "@pulumi/pulumiService"

import { Backend } from "../components/backend";
import { Bus } from "../components/bus";

const config = new pulumi.Config();
const appName = config.require("appName"); 
const nameBase = config.get("nameBase") ?? `${pulumi.getProject()}-${pulumi.getStack()}`;

const backend = new Backend(nameBase)

const bus = new Bus(nameBase, {reader: backend.reader, appName: appName})

// Bus ARN needed for frontend
export const busArn = bus.arn;

// DynamodDB console link to make it easier to demo/test.
const awsConfig = new pulumi.Config("aws");
const region = awsConfig.require("region");
export const EventsTableLink = pulumi.interpolate`https://console.aws.amazon.com/dynamodbv2/home?region=${region}#table?name=${backend.eventsTableName}`

// Add Pulumi tag
const stackTag = new pulumiService.StackTag("stackTag", {
  organization: pulumi.getOrganization(),
  project: pulumi.getProject(),
  stack: pulumi.getStack(),
  name: "TEAM",
  value: "CED"
})