from pulumi import ResourceOptions, Output, export, get_organization, get_project, get_stack
from pulumi_pulumiservice import StackTag
from pulumi_azure_native import resources
import pulumi_kubernetes as k8s

from aks import AksCluster, AksClusterArgs
from cosmos import MongoDb, MongoDbArgs
from ingress_ctl import IngressCtl, IngressCtlArgs

import config
base_name = config.base_name

# Create an Azure Resource Group
resource_group = resources.ResourceGroup(f"{base_name}-rg")

mongodb_name = "contoso-ship-manager"
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

# Deploy backend and frontend applications that provide the Ship Management service.
# These next few blocks of code to create the deployment and service were created by running the YAML files 
# provided in the exercise here:
# https://docs.microsoft.com/en-us/training/modules/aks-manage-application-state/3-exercise-create-resources
# through:
# https://www.pulumi.com/kube2pulumi/

service_name = "ship-manager"
service_namespace = k8s.core.v1.Namespace(service_name,
    metadata=k8s.meta.v1.ObjectMetaArgs(
        name=service_name,
    ),
    opts=ResourceOptions(provider=cluster.k8s_provider, depends_on=[cluster]))

backend_name = f"{service_name}-backend"
backend_deployment = k8s.apps.v1.Deployment(f"{backend_name}-deployment",
    api_version="apps/v1",
    kind="Deployment",
    metadata=k8s.meta.v1.ObjectMetaArgs(
        namespace=service_name,
        name=backend_name,
    ),
    spec=k8s.apps.v1.DeploymentSpecArgs(
        replicas=1,
        selector=k8s.meta.v1.LabelSelectorArgs(
            match_labels={
                "app": backend_name
            },
        ),
        template=k8s.core.v1.PodTemplateSpecArgs(
            metadata=k8s.meta.v1.ObjectMetaArgs(
                labels={
                    "app": backend_name
                },
            ),
            spec=k8s.core.v1.PodSpecArgs(
                containers=[k8s.core.v1.ContainerArgs(
                    image="mcr.microsoft.com/mslearn/samples/contoso-ship-manager:backend",
                    name=backend_name,
                    resources=k8s.core.v1.ResourceRequirementsArgs(
                        requests={
                            "cpu": "100m",
                            "memory": "128Mi",
                        },
                        limits={
                            "cpu": "250m",
                            "memory": "256Mi",
                        },
                    ),
                    ports=[k8s.core.v1.ContainerPortArgs(
                        container_port=3000,
                        name="http",
                    )],
                    env=[
                        k8s.core.v1.EnvVarArgs(
                            name="DATABASE_MONGODB_URI",
                            value=mongodb.db_connection_string,
                        ),
                        k8s.core.v1.EnvVarArgs(
                            name="DATABASE_MONGODB_DBNAME",
                            value=mongodb_name,
                        ),
                    ],
                )],
            ),
        ),
    ), 
    opts=ResourceOptions(provider=cluster.k8s_provider, depends_on=[cluster]))

backend_service = k8s.core.v1.Service(f"{backend_name}-service",
    api_version="v1",
    kind="Service",
    metadata=k8s.meta.v1.ObjectMetaArgs(
        namespace=service_name,
        name=backend_name
    ),
    spec=k8s.core.v1.ServiceSpecArgs(
        selector={
            "app": backend_name
        },
        ports=[k8s.core.v1.ServicePortArgs(
            name="http",
            port=80,
            target_port=3000,
        )],
    ),
    opts=ResourceOptions(provider=cluster.k8s_provider, depends_on=[cluster], delete_before_replace=True))

# Frontend 
frontend_name = "ship-manager-frontend"
frontend_config = f"{frontend_name}-config"

frontend_config_map = k8s.core.v1.ConfigMap(frontend_config,
    api_version="v1",
    kind="ConfigMap",
    metadata=k8s.meta.v1.ObjectMetaArgs(
        namespace=service_name,
        name=frontend_config
    ),
    data=
        # ship_manager_backend_service_ip.apply(lambda ip: {"config.js": """const config = (() => {
        ingress_controller.ingress_service_ip.apply(lambda ip: {"config.js": """const config = (() => {
      return {
        'VUE_APP_BACKEND_BASE_URL': 'http://"""+ip+"""'
      }
    })()
""",
    }),
    opts=ResourceOptions(provider=cluster.k8s_provider, depends_on=[cluster], delete_before_replace=True))

frontend_deployment = k8s.apps.v1.Deployment(f"{frontend_name}-deployment",
    api_version="apps/v1",
    kind="Deployment",
    metadata=k8s.meta.v1.ObjectMetaArgs(
        namespace=service_name,
        name=frontend_name
    ),
    spec=k8s.apps.v1.DeploymentSpecArgs(
        replicas=1,
        selector=k8s.meta.v1.LabelSelectorArgs(
            match_labels={
                "app": frontend_name
            },
        ),
        template=k8s.core.v1.PodTemplateSpecArgs(
            metadata=k8s.meta.v1.ObjectMetaArgs(
                labels={
                    "app": frontend_name
                },
            ),
            spec=k8s.core.v1.PodSpecArgs(
                containers=[k8s.core.v1.ContainerArgs(
                    image="mcr.microsoft.com/mslearn/samples/contoso-ship-manager:frontend",
                    name=frontend_name,
                    image_pull_policy="Always",
                    resources=k8s.core.v1.ResourceRequirementsArgs(
                        requests={
                            "cpu": "100m",
                            "memory": "128Mi",
                        },
                        limits={
                            "cpu": "250m",
                            "memory": "256Mi",
                        },
                    ),
                    ports=[k8s.core.v1.ContainerPortArgs(
                        container_port=80,
                        name="http",
                    )],
                    volume_mounts=[{
                        "name": frontend_config,
                        "mount_path": "/usr/src/app/dist/config.js",
                        "sub_path": "config.js",
                    }],
                )],
                volumes=[k8s.core.v1.VolumeArgs(
                    name=frontend_config,
                    config_map={
                        "name": frontend_config
                    },
                )],
            ),
        ),
    ),
    opts=ResourceOptions(provider=cluster.k8s_provider, depends_on=[cluster,frontend_config_map]))

frontend_service = k8s.core.v1.Service(f"{frontend_name}-service",
    api_version="v1",
    kind="Service",
    metadata=k8s.meta.v1.ObjectMetaArgs(
        namespace=service_name,
        name=frontend_name
    ),
    spec=k8s.core.v1.ServiceSpecArgs(
        selector={
            "app": frontend_name
        },
        ports=[k8s.core.v1.ServicePortArgs(
            name="http",
            port=80,
            target_port=80,
        )],
    ),
    opts=ResourceOptions(provider=cluster.k8s_provider, depends_on=[cluster]))

# Create ingresses for the backend and frontend
ingress_name = "ship-manager-ingresses"
ingresses = k8s.networking.v1.Ingress(ingress_name,
    kind="Ingress",
    metadata=k8s.meta.v1.ObjectMetaArgs(
        name=ingress_name,
        namespace=service_name,
        annotations={
            "nginx.ingress.kubernetes.io/ssl-redirect": "true"
        }
    ),
    spec=k8s.networking.v1.IngressSpecArgs(
        ingress_class_name="nginx",
        rules=[{
                "http": {
                    "paths":[
                        # Backend paths
                        {
                            "pathType": "Prefix",
                            "path": "/ports",
                            "backend": {
                                "service": {
                                    "name": backend_service.metadata.name,
                                    "port": {
                                        "number": 80,
                                    }
                                }
                            }
                        }, 
                        {
                            "pathType": "Prefix",
                            "path": "/ships",
                            "backend": {
                                "service": {
                                    "name": backend_service.metadata.name,
                                    "port": {
                                        "number": 80,
                                    }
                                }
                            }
                        },
                        # Frontend path 
                        {
                            "pathType": "Prefix",
                            "path": "/",
                            "backend": {
                                "service": {
                                    "name": frontend_service.metadata.name,
                                    "port": {
                                        "number": 80,
                                    }
                                }
                            }             
                        }
                    ]
                }
            }]
    ),
    opts=ResourceOptions(provider=cluster.k8s_provider, depends_on=[cluster], delete_before_replace=True))

stack_tag = StackTag("stack_tag",
    organization=get_organization(),
    project=get_project(),
    stack=get_stack(),
    name="Demo",
    value="AzureCosmosDBWorkshop-monoproject"
)

export("resource_group", resource_group.name)
export('mongodb_connection_string', Output.secret(mongodb.db_connection_string))
export('kubeconfig', Output.secret(cluster.kubeconfig))
export('service_url', Output.concat("http://",ingress_controller.ingress_service_ip))

