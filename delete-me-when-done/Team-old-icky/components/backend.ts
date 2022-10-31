import { rds, ec2 } from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// Interface for backend args
export interface DbArgs {
  dbName: string;
  dbUser: string;
  dbPassword: pulumi.Input<string>;
  vpcId: pulumi.Input<any>;
  dbPort?: number;
}

// Creates DB
export class Db extends pulumi.ComponentResource {
  public readonly dbAddress: pulumi.Output<string>;
  public readonly dbName: pulumi.Output<string>;
  public readonly dbUser: pulumi.Output<string>;
  public readonly dbPassword: pulumi.Output<string | undefined>;
  public readonly dbPort: number;

  constructor(name: string, args: DbArgs, opts?: pulumi.ComponentResourceOptions) {

    super("custom:resource:DB", name, args, opts);

    const dbPort = args?.dbPort ?? 3306;

    const rdsSgName = `${name}-rds-sg`;
    const rdsSecurityGroup = new ec2.SecurityGroup(rdsSgName, {
      vpcId: args.vpcId,
      description: "Allow client access",
      tags: { "Name": rdsSgName },
      ingress: [
        {
          cidrBlocks: ["0.0.0.0/0"],
          fromPort: dbPort,
          toPort: dbPort,
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
    }, { parent: this });


    // Create RDS subnet grup
    const rdsSubnetGroupName = `${name}-sng`;
    const subnetIds = ec2.getSubnetIdsOutput({vpcId: args.vpcId})
    const rdsSubnetGroup = new rds.SubnetGroup(rdsSubnetGroupName, {
      subnetIds: subnetIds.ids,
      tags: { "Name": rdsSubnetGroupName},
    }, { parent: this });

    // RDS DB
    const rdsName = `${name}-rds`;
    const db = new rds.Instance(rdsName, {
      dbName: args.dbName,
      username: args.dbUser,
      password: args.dbPassword,
      port: dbPort,
      vpcSecurityGroupIds: [rdsSecurityGroup.id],
      dbSubnetGroupName: rdsSubnetGroup.name,
      allocatedStorage: 20,
      engine: "mysql",
      engineVersion: "5.7",
      instanceClass: "db.t2.micro",
      storageType: "gp2",
      skipFinalSnapshot: true,
      publiclyAccessible: false,
    }, { parent: this });

    this.dbAddress = db.address;
    this.dbName = db.dbName;
    this.dbUser = db.username;
    this.dbPassword = db.password;
    this.dbPort = dbPort;

    this.registerOutputs({});
  }
}
