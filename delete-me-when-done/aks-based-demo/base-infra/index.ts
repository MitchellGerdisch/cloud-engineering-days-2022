import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as cosmos from "../components/cosmos";
import * as aks from "../components/aks";
import * as ingress from "../components/ingressCtl";
import * as random from "@pulumi/random";
import * as tls from "@pulumi/tls";

const config = new pulumi.Config();
const baseName = config.get("baseName") || "ced-demo";
export const dbName = config.get("dbName") || "contoso-ship-manager";
const clusterNodeCount = config.getNumber("clusterNodeCount") || 3;
const clusterNodeSize = config.get("clusterNodeSize") || "Standard_B2s";
const clusterK8sVersion = config.get("clusterK8sVersion") || "1.24.3";
const adminUsername = config.get("adminUsername") || "dbuser";

// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup(`${baseName}-rg`);

// Create MongoDb
const mongoDb = new cosmos.MongoDb(`${baseName}-mongodb`, {
    rgName: resourceGroup.name,
    location: resourceGroup.location,
    dbName: dbName,
    dbCollections: ["ports", "ships"],
});

// Create AKS
const k8sCluster = new aks.AksCluster(`${baseName}-aks`, {
    rgName: resourceGroup.name,
    clusterNodeCount: clusterNodeCount,
    clusterK8sVersion: clusterK8sVersion,
    clusterNodeSize: clusterNodeSize,
    adminUsername: adminUsername,
})

// Set up ingress controller
const ingressController = new ingress.IngressCtl(`${baseName}-ingress`, {
  kubeconfig: k8sCluster.kubeconfig
})

export const kubeconfig = k8sCluster.kubeconfig;
export const dbConnectionString = mongoDb.dbConnectionString;
export const ingressIp = ingressController.ingressCtlIp;
