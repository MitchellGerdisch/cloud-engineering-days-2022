import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as k8s from "@pulumi/kubernetes";
import { ServiceDeployment, ServiceDeploymentArgs } from "@pulumi/k8s-servicedeployment";

const org = pulumi.getOrganization();
const project = pulumi.getProject();
const stack = pulumi.getStack();
const config = new pulumi.Config();
const nameBase = config.get("nameBase") ?? `${project}-${stack}`;
const eksProject = config.require("eksProject");
const eksProjectStackRef = new pulumi.StackReference(`${org}/${eksProject}/${stack}`);

const kubeconfig = eksProjectStackRef.requireOutput("kubeconfig") 
const k8sProvider = new k8s.Provider('k8s-provider', {
  kubeconfig: kubeconfig
});

const guestbookNs = new k8s.core.v1.Namespace("guestbook-ts-ns", {}, {provider: k8sProvider})
const guestbookNsName = guestbookNs.metadata.name;

const leader = new ServiceDeployment("redis-leader", {
    namespace: guestbookNsName,
    image: "redis",
    ports: [6379],
}, {provider: k8sProvider});

const replica = new ServiceDeployment("redis-replica", {
    namespace: guestbookNsName,
    image: "pulumi/guestbook-redis-replica",
    ports: [6379],
}, {provider: k8sProvider});

const frontend = new ServiceDeployment("frontend", {
    namespace: guestbookNsName,
    image: "pulumi/guestbook-php-redis",
    replicas: 3,
    ports: [80],
    serviceType: "LoadBalancer",
}, {provider: k8sProvider});

export const frontEndUrl = pulumi.interpolate`http://${frontend.frontEndIp}`;

