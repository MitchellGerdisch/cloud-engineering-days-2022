from pulumi import ComponentResource, ResourceOptions, Output
import pulumi_kubernetes as k8s

class IngressCtlArgs:

    def __init__(self,
                 namespace="ingress-ctl",
                 ):

        self.namespace = namespace

class IngressCtl(ComponentResource):

    def __init__(self,
                 name: str,
                 args: IngressCtlArgs,
                 opts: ResourceOptions = None):

        super().__init__('custom:kubernetes:IngressCtl', name, {}, opts)
        opts.parent = self

        namespace = args.namespace

        # Set up ingress controller
        ingress_namespace = k8s.core.v1.Namespace(f"{name}-{namespace}",
            metadata=k8s.meta.v1.ObjectMetaArgs(
                name=namespace
            ),
            opts=opts)

        nginx_ingress_name = "ingress-ctl"
        nginx_ingress = k8s.helm.v3.Chart(nginx_ingress_name, k8s.helm.v3.ChartOpts(
            fetch_opts={
                'repo': "https://kubernetes.github.io/ingress-nginx"
            },
            chart="ingress-nginx",
            namespace=ingress_namespace.metadata.name,
            values= {
                'controller': {
                    'replicaCount': 1,
                    'ingressClassResource': {
                        'default': True
                    },
                    'nodeSelector': {
                        "beta.kubernetes.io/os": "linux"
                    },
                    'admissionWebhooks': {
                        'patch': {
                            'nodeSelector': {
                                "beta.kubernetes.io/os": "linux"
                            }
                        }
                    }
                },
                'defaultBackend': {
                    'nodeSelector': {
                        "beta.kubernetes.io/os": "linux"
                    }
                }
            }),
            opts)

        ingress_service = nginx_ingress.get_resource("v1/Service", f"{namespace}/{nginx_ingress_name}-ingress-nginx-controller")
        self.ingress_service_ip = ingress_service.status.load_balancer.ingress[0].ip

