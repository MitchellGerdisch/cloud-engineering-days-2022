import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";
import * as backend from "./backend";
import * as frontend from "./frontend";
import * as network from "./network";

// Build a base name for naming conventions
const baseName= `${pulumi.getProject()}-${pulumi.getStack()}`

// Get config data
const config = new pulumi.Config();
const dbName = config.get("dbName") || "wordpress";
const dbUser = config.get("dbUser") || "admin";

// Get secretified password from config or create one using the "random" package
let dbPassword = config.getSecret("dbPassword");
if (!dbPassword) {
  dbPassword = new random.RandomPassword("dbPassword", {
    length: 16,
    special: true,
    overrideSpecial: "_%",
  }).result;
}

const vpc = new network.Vpc(`${baseName}-net`, {});

const db = new backend.Db(`${baseName}-db`, {
  dbName: dbName,
  dbUser: dbUser,
  dbPassword: dbPassword,
  subnetIds: vpc.subnetIds,
  securityGroupIds: vpc.rdsSecurityGroupIds,
});

const fe = new frontend.FrontendInfra(`${baseName}-fe`, {
  vpcId: vpc.vpcId,
  subnetIds: vpc.subnetIds,
  securityGroupIds: vpc.feSecurityGroupIds,
});

export const webServiceUrl = pulumi.interpolate`http://${fe.dnsName}`;
export const ecsClusterName = fe.clusterName;
export const alb = fe.albArn;
export const databaseAddress = db.dbAddress;
export const databaseUserName = db.dbUser;
export const databasePassword = db.dbPassword;
