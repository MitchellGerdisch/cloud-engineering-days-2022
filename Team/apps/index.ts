import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";
import * as frontend from "./frontend";

// Get outputs from base stack
const config = new pulumi.Config();
const baseInfraProject = config.require("baseProject");
const org = pulumi.getOrganization();
const stack = pulumi.getStack();

const baseStackRef = new pulumi.StackReference(`${org}/${baseInfraProject}/${stack}`)
const db

const fe = new frontend.WebService(`${serviceName}-fe`, {
  dbHost: db.dbAddress,
  dbPort: "3306",
  dbName: db.dbName,
  dbUser: db.dbUser,
  dbPassword: db.dbPassword,
  vpcId: vpc.vpcId,
  subnetIds: vpc.subnetIds,
  securityGroupIds: vpc.feSecurityGroupIds,
});

export const webServiceUrl = pulumi.interpolate`http://${fe.dnsName}`;
export const ecsClusterName = fe.clusterName;
export const databaseEndpoint = db.dbAddress;
export const databaseUserName = db.dbUser;
export const databasePassword = db.dbPassword;
