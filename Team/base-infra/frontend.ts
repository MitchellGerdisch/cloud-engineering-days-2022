// Copyright 2016-2019, Pulumi Corporation.  All rights reserved.

import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// Interface for backend args
export interface WebServiceArgs {
  vpcId: pulumi.Output<string>;
  subnetIds: pulumi.Output<string>[];
  securityGroupIds: pulumi.Output<string>[];
}

// Creates DB
export class FrontendInfra extends pulumi.ComponentResource {
  public readonly dnsName: pulumi.Output<string>;
  public readonly albArn: pulumi.Output<string>;
  public readonly clusterName: pulumi.Output<string>;

  constructor(name: string, args: WebServiceArgs, opts?: pulumi.ComponentResourceOptions) {

    super("custom:resource:FrontendInfra", name, args, opts);

    // Create ECS cluster to run a container-based service
    const cluster = new aws.ecs.Cluster(`${name}-ecs`, {}, { parent: this });

    // Create load balancer to listen for HTTP traffic
    const alb = new aws.lb.LoadBalancer(`${name}-alb`, {
      securityGroups: args.securityGroupIds,
      subnets: args.subnetIds,
    }, { parent: this });

    this.dnsName = alb.dnsName;
    this.albArn = alb.arn;
    this.clusterName = cluster.name;

    this.registerOutputs({});
  }
}
