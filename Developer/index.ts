import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { nameBase } from "./config";
import { dbUser, dbPassword, dbEngine, dbEngineVersion, dbInstanceClass, dbStorageType, dbApplyImmediately, dbMultiAz, dbSkipFinalSnapshot } from "./config-db";

// Build a VPC and related accoutrements using Pulumi-provided AWSX package.
const vpc = new awsx.ec2.Vpc(`${nameBase}-vpc`);

// Build RDS Security Group
const rdsSgName = `${nameBase}-rds-sg`;
const rdsSecurityGroup = new aws.ec2.SecurityGroup(rdsSgName, {
  vpcId: vpc.vpcId,
  description: "Allow client access",
  tags: { "Name": rdsSgName },
  ingress: [
    {
      cidrBlocks: ["0.0.0.0/0"],
      fromPort: 3306,
      toPort: 3306,
      protocol: "tcp",
      description: "Allow RDS access",
    },
  ],
  egress: [
    {
      protocol: "-1",
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ["0.0.0.0/0"],
    },
  ],
});

// Create RDS subnet group
const rdsSubnetGroupName = `${nameBase}-sng`;
const rdsSubnetGroup = new aws.rds.SubnetGroup(rdsSubnetGroupName, {
  subnetIds: vpc.privateSubnetIds,
  tags: { "Name": rdsSubnetGroupName},
});

// RDS DB
const rdsName = `${nameBase}-rds`.split("-").join(""); // naming convention uses hyphens but rds name can't have hyphens
const db = new aws.rds.Instance(rdsName, {
  dbName: rdsName,
  username: dbUser,
  password: dbPassword,
  vpcSecurityGroupIds: [rdsSecurityGroup.id],
  dbSubnetGroupName: rdsSubnetGroup.name,
  allocatedStorage: 20,
  engine: dbEngine,
  engineVersion: dbEngineVersion,
  instanceClass: dbInstanceClass,
  storageType: dbStorageType,
  skipFinalSnapshot: dbSkipFinalSnapshot,
  multiAz: dbMultiAz,
  applyImmediately: dbApplyImmediately,
  publiclyAccessible: false,
});

export const databaseAddress = db.address;
export const databaseName = db.dbName;
export const databaseUser = db.username;
export const databasePassword = db.password;
