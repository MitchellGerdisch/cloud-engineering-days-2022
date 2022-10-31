import { nameBase } from "./config";
import { FrontendInfra } from "../components/frontend";
import { Vpc } from "../components/network";

const vpc = new Vpc(`${nameBase}-net`);

const fe = new FrontendInfra(`${nameBase}-fe`, {
  vpcId: vpc.vpcId,
  subnetIds: vpc.subnetIds,
  securityGroupIds: vpc.feSecurityGroupIds,
});

export const dnsName = fe.dnsName;
export const clusterArn = fe.clusterArn;
export const albArn = fe.albArn;
export const vpcId = vpc.vpcId;
