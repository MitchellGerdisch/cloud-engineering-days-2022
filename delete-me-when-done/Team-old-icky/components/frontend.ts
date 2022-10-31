import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// Interface for frontend base infra args
export interface FrontendInfraArgs{
  vpcId: pulumi.Output<any>;
  subnetIds: pulumi.Output<string>[];
  securityGroupIds: pulumi.Output<string>[];
}

// Creates frontend base infrastructure
export class FrontendInfra extends pulumi.ComponentResource {
  public readonly dnsName: pulumi.Output<string>;
  public readonly albArn: pulumi.Output<string>;
  public readonly clusterArn: pulumi.Output<string>;

  constructor(name: string, args: FrontendInfraArgs, opts?: pulumi.ComponentResourceOptions) {

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
    this.clusterArn = cluster.arn;

    this.registerOutputs({});
  }
}

// Interface for frontend webservice args
export interface WebServiceArgs {
  albArn: pulumi.Input<any>;
  clusterArn: pulumi.Input<any>;
  vpcId: pulumi.Output<any>;
  dbHost: pulumi.Output<string>;
  dbName: pulumi.Output<string>;
  dbUser: pulumi.Output<string>;
  dbPassword: pulumi.Output<string | undefined>;
  dbPort: number;
}

// Creates Frontend Webservice
export class WebService extends pulumi.ComponentResource {

  constructor(name: string, args: WebServiceArgs, opts?: pulumi.ComponentResourceOptions) {

    super("custom:resource:WebService", name, args, opts);


    const feSgName = `${name}-fe-sg`;
    const feSecurityGroup = new aws.ec2.SecurityGroup(feSgName, {
      vpcId: args.vpcId,
      description: "Allows all HTTP(s) traffic.",
      tags: { "Name": feSgName },
      ingress: [
        {
          cidrBlocks: ["0.0.0.0/0"],
          fromPort: 443,
          toPort: 443,
          protocol: "tcp",
          description: "Allow https",
        },
        {
          cidrBlocks: ["0.0.0.0/0"],
          fromPort: 80,
          toPort: 80,
          protocol: "tcp",
          description: "Allow http",
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


    const atg = new aws.lb.TargetGroup(`${name}-app-tg`, {
      port: 80,
      protocol: "HTTP",
      targetType: "ip",
      vpcId: args.vpcId,
      healthCheck: {
        healthyThreshold: 2,
        interval: 5,
        timeout: 4,
        protocol: "HTTP",
        matcher: "200-399",
      },
    }, { parent: this });

    const wl = new aws.lb.Listener(`${name}-listener`, {
      loadBalancerArn: args.albArn,
      port: 80,
      defaultActions: [
        {
          type: "forward",
          targetGroupArn: atg.arn,
        },
      ],
    }, { parent: this });

    const assumeRolePolicy = {
      "Version": "2008-10-17",
      "Statement": [{
          "Sid": "",
          "Effect": "Allow",
          "Principal": {
              "Service": "ecs-tasks.amazonaws.com",
          },
          "Action": "sts:AssumeRole",
      }],
    };

    const role = new aws.iam.Role(`${name}-task-role`, {
      assumeRolePolicy: JSON.stringify(assumeRolePolicy),
      }, { parent: this });

    const rpa = new aws.iam.RolePolicyAttachment(`${name}-task-policy`, {
      role: role.name,
      policyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    }, { parent: this });

    // Spin up a load balanced service running our container image.
    const taskName = `${name}-app-task`;
    const containerName = `${name}-app-container`;
    const taskDefinition = pulumi.all([args.dbHost, args.dbPort, args.dbName, args.dbUser, args.dbPassword]).
      apply(([dbHost, dbPort, dbName, dbUser, dbPassword]) =>
        new aws.ecs.TaskDefinition(taskName, {
          family: "fargate-task-definition",
          cpu: "256",
          memory: "512",
          networkMode: "awsvpc",
          requiresCompatibilities: ["FARGATE"],
          executionRoleArn: role.arn,
          containerDefinitions: JSON.stringify([{
            "name": containerName,
            "image": "wordpress",
            "portMappings": [{
              "containerPort": 80,
              "hostPort": 80,
              "protocol": "tcp",
            }],
            "environment": [
              {
                "name": "WORDPRESS_DB_HOST",
                "value": `${args.dbHost}:${args.dbPort}`,
              },
              {
                "name": "WORDPRESS_DB_NAME",
                "value": `${args.dbName}`,
              },
              {
                "name": "WORDPRESS_DB_USER",
                "value": `${args.dbUser}`,
              },
              {
                "name": "WORDPRESS_DB_PASSWORD",
                "value": `${args.dbPassword}`,
              },
            ],
          }]),
        }, { parent: this }),
      );

    const subnetIds = aws.ec2.getSubnetIdsOutput({vpcId: args.vpcId})
    const service = new aws.ecs.Service(`${name}-app-svc`, {
      cluster: args.clusterArn,
      desiredCount: 1,
      launchType: "FARGATE",
      taskDefinition: taskDefinition.arn,
      networkConfiguration: {
        assignPublicIp: true,
        subnets: subnetIds.ids,
        securityGroups: [feSecurityGroup.id],
      },
      loadBalancers: [{
          targetGroupArn: atg.arn,
          containerName: containerName,
          containerPort: 80,
      }],
    }, { dependsOn: [wl], parent: this});

    this.registerOutputs({});
  }
}
