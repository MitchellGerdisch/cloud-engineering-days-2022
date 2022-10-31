import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

export interface IngressCtlArgs {
    kubeconfig: pulumi.Input<string>;
}

export class IngressCtl extends pulumi.ComponentResource {
  public readonly ingressCtlIp: pulumi.Output<string>;

  constructor(name: string, args: IngressCtlArgs, opts?: pulumi.ComponentResourceOptions) {

    super("custom:resource:IngressCtl", name, args, opts);

    // Instantiate the k8s provider
    const k8sProvider = new k8s.Provider("k8sProvider", {
        kubeconfig: args.kubeconfig
    })

    // Set up ingress controller
    const namespace = "ingress-ctl";

    const ingressNamespace = new k8s.core.v1.Namespace(`${name}-${namespace}`, {
       metadata: {
        name: namespace,
       } 
    }, {provider: k8sProvider, parent: this});

    const ingressName = "ingress-ctl"
    const nginxIngress = new k8s.helm.v3.Chart(ingressName, {
        fetchOpts: {
            repo: "https://kubernetes.github.io/ingress-nginx" 
        },
        chart: "ingress-nginx",
        namespace: ingressNamespace.metadata.name,
        values: {
            'controller': {
                'replicaCount': 1,
                'ingressClassResource': {
                    'default': true
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
        }, 

    }, {provider: k8sProvider, parent: this});
            

    const ingressService = nginxIngress.getResource("v1/Service", `${namespace}/${ingressName}-ingress-nginx-controller`);
    this.ingressCtlIp = ingressService.status.loadBalancer.ingress[0].ip
  }
}
