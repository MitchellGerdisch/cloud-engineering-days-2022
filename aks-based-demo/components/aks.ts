import * as pulumi from "@pulumi/pulumi";
import * as azuread from "@pulumi/azuread";
import * as random from "@pulumi/random";
import * as tls from "@pulumi/tls";

import * as containerservice from "@pulumi/azure-native/containerservice";
import * as resources from "@pulumi/azure-native/resources";


export interface AksClusterArgs {
  rgName: string;
  clusterNodeCount: number;
  clusterK8sVersion: string;
  clusterNodeSize: string;
  adminUsername: string;
  sshPublicKey: string;
}

export class AksCluster extends pulumi.ComponentResource {
  public readonly kubeconfig: pulumi.Output<string>;

  constructor(name: string, args: AksClusterArgs, opts?: pulumi.ComponentResourceOptions) {

    super("custom:resource:AksCluster", name, args, opts);

    // Create an AD service principal
    const adAppName = `${name}-aks-app`;
    const adApp = new azuread.Application(adAppName, {
        displayName: adAppName,
    }, {parent: this});
    const adSp = new azuread.ServicePrincipal(`${name}-aks-sp`, {
        applicationId: adApp.applicationId,
    }, {parent: this});

    // Create the Service Principal Password
    const adSpPassword = new azuread.ServicePrincipalPassword(`${name}-aks-sp-pwd`, {
        servicePrincipalId: adSp.id,
        endDate: "2099-01-01T00:00:00Z",
    }, {parent: this});

    // Generate an SSH key
    const sshKey = new tls.PrivateKey(`${name}-ssh-key`,{
        algorithm: "RSA",
        rsaBits: 4096,
    }, {parent: this});

    // Build AKS Cluster
    const managedClusterName = `${name}-aks`;
    const cluster = new containerservice.ManagedCluster(managedClusterName, {
        resourceGroupName: args.rgName,
        agentPoolProfiles: [{
            count: args.clusterNodeCount,
            maxPods: 110,
            mode: "System",
            name: "agentpool",
            nodeLabels: {},
            osDiskSizeGB: 30,
            osType: "Linux",
            type: "VirtualMachineScaleSets",
            vmSize: args.clusterNodeSize,
        }],
        dnsPrefix: args.rgName,
        enableRBAC: true,
        kubernetesVersion: args.clusterK8sVersion,
        linuxProfile: {
            adminUsername: args.adminUsername,
            ssh: {
                publicKeys: [{
                    keyData: sshKey.publicKeyOpenssh,
                }],
            },
        },
        nodeResourceGroup: `${managedClusterName}-node-group`,
        servicePrincipalProfile: {
            clientId: adApp.applicationId,
            secret: adSpPassword.value,
        },
    }, {parent: this});

    const creds = containerservice.listManagedClusterUserCredentialsOutput({
        resourceGroupName: args.rgName,
        resourceName: cluster.name,
    }, {parent: this});

    const encoded = creds.kubeconfigs[0].value;
    this.kubeconfig = pulumi.secret(encoded.apply(enc => Buffer.from(enc, "base64").toString()));

  }

}
