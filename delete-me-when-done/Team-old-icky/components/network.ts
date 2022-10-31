import { ec2 } from "@pulumi/aws";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// Interface for VPC args
export interface VpcArgs {
  cidrBlock?: string;
  instanceTenancy?: string;
  enableDnsHostnames?: boolean;
  enableDnsSupport?: boolean;
}

// Creates Vpc
export class Vpc extends pulumi.ComponentResource {
  public readonly vpcId: pulumi.Output<string>;
  public readonly subnetIds: pulumi.Output<string>[] = [];
  public readonly rdsSecurityGroupIds: pulumi.Output<string>[] = [];
  public readonly feSecurityGroupIds: pulumi.Output<string>[] = [];

  constructor(name: string, args?: VpcArgs, opts?: pulumi.ComponentResourceOptions) {

    super("custom:resource:VPC", name, args, opts);

    const vpcName = `${name}-vpc`;

    const cidrBlock = args?.cidrBlock ?? "10.100.0.0/16";
    const instanceTenancy = args?.instanceTenancy ?? "default";
    const enableDnsHostnames = args?.enableDnsHostnames ?? true;
    const enableDnsSupport = args?.enableDnsSupport ?? true;

    const vpc = new ec2.Vpc(vpcName, {
      cidrBlock: cidrBlock,
      instanceTenancy: instanceTenancy,
      enableDnsHostnames: enableDnsHostnames,
      enableDnsSupport: enableDnsSupport,
      tags: { "Name": vpcName },
    }, { parent: this });

    const igwName = `${name}-igw`;
    const igw = new ec2.InternetGateway(igwName, {
      vpcId: vpc.id,
      tags: { "Name": igwName},
    }, {parent: this});

    const rtName = `${name}-rt`;
    const routeTable = new ec2.RouteTable(rtName, {
      vpcId: vpc.id,
      routes: [{cidrBlock: "0.0.0.0/0", gatewayId: igw.id}],
      tags: { "Name": rtName},
    }, {parent: this});

    // Subnets, at least across two zones
    const allZones = aws.getAvailabilityZones({state: "available"});
    // Limiting to 2 zones for speed and to meet minimal requirements.
    const subnets: pulumi.Output<string>[] = [];
    const subnetNameBase = `${name}-subnet`;
    for (let i = 0; i < 2; i++) {
      const az = allZones.then(it => it.zoneIds[i]);
      const subnetName = `${subnetNameBase}-${i}`;
      const vpcSubnet = new ec2.Subnet(subnetName, {
        assignIpv6AddressOnCreation: false,
        vpcId: vpc.id,
        mapPublicIpOnLaunch: true,
        cidrBlock: `10.100.${subnets.length}.0/24`,
        availabilityZoneId: az,
        tags: {"Name": subnetName},
      }, { parent: this });

      const _ = new ec2.RouteTableAssociation(`vpc-route-table-assoc-${i}`, {
        routeTableId: routeTable.id,
        subnetId: vpcSubnet.id,
      }, { parent: this });

      subnets.push(vpcSubnet.id);
    }

    this.vpcId = vpc.id;
    this.subnetIds = subnets;
    this.registerOutputs({});
  }
}
