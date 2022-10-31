import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";


// Build a base name for naming conventions
const baseName= `${pulumi.getProject()}-${pulumi.getStack()}`

// Get config
const config = new pulumi.Config();
const baseInfraProject = config.require("baseProject");
const serviceName = config.get("serviceName") || "ship-manager";

// Get information from base stack
const org = pulumi.getOrganization();
const stack = pulumi.getStack();
const baseStackRef = new pulumi.StackReference(`${org}/${baseInfraProject}/${stack}`)
const kubeconfig = baseStackRef.requireOutput("kubeconfig");
const dbConnectionString = baseStackRef.requireOutput("dbConnectionString");
const dbName = baseStackRef.requireOutput("dbName");
const serviceIp = baseStackRef.requireOutput("ingressIp");

// Instantiate K8s provider
const k8sProvider = new k8s.Provider("k8sProvider", {
    kubeconfig: kubeconfig
})

const serviceNamespace = new k8s.core.v1.Namespace(serviceName, {
    metadata: {
        name: serviceName,
    },
}, {provider: k8sProvider});

const backendName = `${serviceName}-backend`; 
const backendDeployment = new k8s.apps.v1.Deployment(`${backendName}-deployment`, {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
        namespace: serviceName,
        name: backendName,
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: {
                "app": backendName
            },
        },
        template: {
            metadata: {
                labels: {
                    "app": backendName,
                },
            },
            spec: {
                containers: [
                    {
                        image: "mcr.microsoft.com/mslearn/samples/contoso-ship-manager:backend",
                        name: backendName,
                        resources: {
                            requests: {
                                "cpu": "100m",
                                "memory": "128Mi",
                            },
                            limits: {
                                "cpu": "250m",
                                "memory": "256Mi",
                            },
                        },
                        ports: [{
                            containerPort: 3000,
                            name: "http",
                        }],
                        env: [
                            {
                                name: "DATABASE_MONGODB_URI",
                                value: dbConnectionString,
                            }, 
                            {
                                name:"DATABASE_MONGODB_DBNAME",
                                value: dbName,
                            }
                        ]
                    }
                ]
            }
        }
    }
}, {provider: k8sProvider});

const backendService = new k8s.core.v1.Service(`${backendName}-service`, {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
        namespace: serviceName,
        name: backendName,
    },
    spec: {
        selector: {
            "app": backendName
        },
        ports: [{
            name: "http",
            port: 80,
            targetPort: 3000
        }]
    }
}, {provider: k8sProvider})

const frontendName = `${serviceName}-frontend`;
const frontendConfig = `${frontendName}-config`;

const frontendConfigMap = new k8s.core.v1.ConfigMap(frontendConfig, {
    apiVersion: "v1",
    kind: "ConfigMap",
    metadata: {
        namespace: serviceName,
        name: frontendConfig
    },
    data: //serviceIp.apply(ip => 
        {"config.js": `"const config = (() => { return {'VUE_APP_BACKEND_BASE_URL': 'http://${serviceIp}})()`}
}, {provider:k8sProvider});

const frontendDeployment = new k8s.apps.v1.Deployment(`${frontendName}-deployment`, {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
        namespace: serviceName,
        name: frontendName
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: {
                "app": frontendName,
            },
        },
        template: {
            metadata: {
                labels: {
                    "app": frontendName,
                },
            },
            spec: {
                containers: [
                    {
                        image: "mcr.microsoft.com/mslearn/samples/contoso-ship-manager:frontend",
                        name: frontendName,
                        imagePullPolicy: "Always",
                        resources: {
                            requests: {
                                "cpu": "100m",
                                "memory": "128Mi",
                            },
                            limits: {
                                "cpu": "250m",
                                "memory": "256Mi",
                            },
                        },
                        ports: [{
                            containerPort: 80,
                            name: "http",
                        }],
                        volumeMounts: [{
                            name: frontendConfig,
                            mountPath: "/usr/src/app/dist/config.js",
                            subPath: "config.js",
                        }],
                        env: [
                            {
                                name: "DATABASE_MONGODB_URI",
                                value: dbConnectionString,
                            }, 
                            {
                                name:"DATABASE_MONGODB_DBNAME",
                                value: dbName,
                            }
                        ]
                    }
                ],
                volumes: [{
                    name: frontendConfig,
                    configMap: {
                        "name": frontendConfig
                    }
                }]
            }
        }
    }
}, {provider: k8sProvider});

const frontendService = new k8s.core.v1.Service(`${frontendName}-service`, {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
        namespace: serviceName,
        name: frontendName,
    },
    spec: {
        selector: {
            "app": frontendName
        },
        ports: [{
            name: "http",
            port: 80,
            targetPort: 80
        }]
    }
}, {provider: k8sProvider})

// Create ingresses
const ingressName = "ship-manager-ingresses";
const ingresses = new k8s.networking.v1.Ingress(ingressName, {
    kind: "Ingress",
    metadata: {
        name: ingressName,
        namespace: serviceName,
        annotations: {
            "nginx.ingress.kubernetes.io/ssl-redirect": "true"
        }
    },
    spec: {
        ingressClassName: "nginx",
        rules: [{
            "http": {
                "paths": [
                    // Backend paths
                    {
                        "pathType": "Prefix",
                        "path": "/ports",
                        "backend": {
                            "service": {
                                "name": backendService.metadata.name,
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
                                "name": backendService.metadata.name,
                                "port": {
                                    "number": 80,
                                }
                            }
                        }
                    },
                    //Frontend path 
                    {
                        "pathType": "Prefix",
                        "path": "/",
                        "backend": {
                            "service": {
                                "name": frontendService.metadata.name,
                                "port": {
                                    "number": 80,
                                }
                            }
                        }             
                    }
                ]
            }
        }]
    }
}, {provider: k8sProvider})


