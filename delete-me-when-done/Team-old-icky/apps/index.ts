import { VpcIpv4CidrBlockAssociation } from "@pulumi/aws/ec2";
import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";
import { Db } from "../components/backend";
import { WebService } from  "../components/frontend";

// Build a base name for naming conventions
const nameBase = `${pulumi.getProject()}-${pulumi.getStack()}`

// Stack config data
const config = new pulumi.Config();
const dbName = config.get("dbName") || "wordpress";
const dbUser = config.get("dbUser") || "admin";
const baseInfraProject = config.require("baseProject");

// Get outputs from base infrastructure stack
const org = pulumi.getOrganization();
const stack = pulumi.getStack();
const baseStackRef = new pulumi.StackReference(`${org}/${baseInfraProject}/${stack}`);
const vpcId = baseStackRef.requireOutput("vcpId");
const albArn = baseStackRef.requireOutput("albArn");
const clusterArn = baseStackRef.requireOutput("clusterArn");
const dnsName = baseStackRef.requireOutput("dnsName");

// Get secretified password from config or create one using the "random" package
let dbPassword = config.getSecret("dbPassword");
if (!dbPassword) {
  dbPassword = new random.RandomPassword("dbPassword", {
    length: 16,
    special: true,
    overrideSpecial: "_%",
  }).result;
}

const db = new Db(`${nameBase}-db`, {
  dbName: dbName,
  dbUser: dbUser,
  dbPassword: dbPassword,
  vpcId: vpcId,
});

const fe = new WebService(`${nameBase}-fe`, {
  albArn: albArn,
  clusterArn: clusterArn,
  vpcId: vpcId,
  dbHost: db.dbAddress,
  dbPort: db.dbPort,
  dbName: db.dbName,
  dbUser: db.dbUser,
  dbPassword: db.dbPassword,
});

export const webServiceUrl = pulumi.interpolate`http://${dnsName}`;
export const databaseEndpoint = db.dbAddress;
export const databaseUserName = db.dbUser;
export const databasePassword = db.dbPassword;
