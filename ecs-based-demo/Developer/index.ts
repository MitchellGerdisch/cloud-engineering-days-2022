import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Get config data
const config = new pulumi.Config();
const dbUser = config.get("dbUser") || "admin";
const engineVersion = config.get("engineVersion") || "5.7";
const instanceClass = config.get("instanceClass") || "db.t2.micro";
const storageType = config.get("storageType")  || "gp2";

// Get secretified password from config or create one using the "random" package
let dbPassword = config.getSecret("dbPassword");
if (!dbPassword) {
  dbPassword = new random.RandomPassword("dbPassword", {
    length: 16,
    special: true,
    overrideSpecial: "_%",
  }).result;
}

// Construct a base name for naming convention purposes.
const baseName= `${pulumi.getProject()}-${pulumi.getStack()}`

// Build a VPC and related accoutrements.
const vpcName = `${baseName}-vpc`
const vpc = new awsx.ec2.Vpc(vpcName)

const rdsSgName = `${baseName}-rds-sg`;
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

// Create RDS subnet grup
const rdsSubnetGroupName = `${baseName}-sng`;
const rdsSubnetGroup = new aws.rds.SubnetGroup(rdsSubnetGroupName, {
  subnetIds: vpc.privateSubnetIds,
  tags: { "Name": rdsSubnetGroupName},
});

// RDS DB
const rdsName = `${baseName}-rds`.split("-").join("");
const db = new aws.rds.Instance(rdsName, {
  dbName: rdsName,
  username: dbUser,
  password: dbPassword,
  vpcSecurityGroupIds: [rdsSecurityGroup.id],
  dbSubnetGroupName: rdsSubnetGroup.name,
  allocatedStorage: 20,
  engine: "mysql",
  engineVersion: engineVersion,
  instanceClass: instanceClass,
  storageType: storageType,
  skipFinalSnapshot: true,
  publiclyAccessible: false,
});

export const databaseAddress = db.address;
export const databaseName = db.dbName;
export const databaseUser = db.username;
export const databasePassword = db.password;
