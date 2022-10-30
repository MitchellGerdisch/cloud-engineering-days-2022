from pulumi import ResourceOptions, Output, export, get_organization, get_project, get_stack
from pulumi_pulumiservice import StackTag
from pulumi_azure_native import resources

from aks import AksCluster, AksClusterArgs
from cosmos import MongoDb, MongoDbArgs
from ingress_ctl import IngressCtl, IngressCtlArgs

import config
base_name = config.base_name

# Create an Azure Resource Group
resource_group = resources.ResourceGroup(f"{base_name}-rg")

mongodb_name = config.app_name
mongodb = MongoDb(base_name, MongoDbArgs(
    rg_name=resource_group.name,
    location=resource_group.location,
    db_name=mongodb_name,
    db_collections=["ports", "ships"]
), opts=ResourceOptions())

cluster = AksCluster(base_name, AksClusterArgs(
    rg_name=resource_group.name,
    cluster_node_count=config.node_count,
    cluster_node_size=config.node_size,
    cluster_k8s_version=config.k8s_version,
    admin_username=config.admin_username,
    ssh_public_key=config.ssh_public_key
), opts=ResourceOptions())

ingress_controller = IngressCtl(base_name, IngressCtlArgs(), opts=ResourceOptions(provider=cluster.k8s_provider, depends_on=[cluster]))

stack_tag = StackTag("stack_tag",
    organization=get_organization(),
    project=get_project(),
    stack=get_stack(),
    name="Demo",
    value="AzureCosmosDBWorkshop-multiproject"
)

export("resource_group", resource_group.name)
export("mongodb_name", mongodb_name)
export('mongodb_connection_string', Output.secret(mongodb.db_connection_string))
export('kubeconfig', Output.secret(cluster.kubeconfig))
export('service_ip', ingress_controller.ingress_service_ip)

