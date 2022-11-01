// *** WARNING: this file was generated by Pulumi SDK Generator. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as utilities from "./utilities";

export class ServiceDeployment extends pulumi.ComponentResource {
    /** @internal */
    public static readonly __pulumiType = 'k8s-servicedeployment:index:ServiceDeployment';

    /**
     * Returns true if the given object is an instance of ServiceDeployment.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    public static isInstance(obj: any): obj is ServiceDeployment {
        if (obj === undefined || obj === null) {
            return false;
        }
        return obj['__pulumiType'] === ServiceDeployment.__pulumiType;
    }

    /**
     * The front end IP
     */
    public /*out*/ readonly frontEndIp!: pulumi.Output<string>;

    /**
     * Create a ServiceDeployment resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args: ServiceDeploymentArgs, opts?: pulumi.ComponentResourceOptions) {
        let inputs: pulumi.Inputs = {};
        opts = opts || {};
        if (!opts.id) {
            if ((!args || args.image === undefined) && !opts.urn) {
                throw new Error("Missing required property 'image'");
            }
            if ((!args || args.ports === undefined) && !opts.urn) {
                throw new Error("Missing required property 'ports'");
            }
            inputs["image"] = args ? args.image : undefined;
            inputs["namespace"] = args ? args.namespace : undefined;
            inputs["ports"] = args ? args.ports : undefined;
            inputs["replicas"] = args ? args.replicas : undefined;
            inputs["serviceType"] = args ? args.serviceType : undefined;
            inputs["frontEndIp"] = undefined /*out*/;
        } else {
            inputs["frontEndIp"] = undefined /*out*/;
        }
        if (!opts.version) {
            opts = pulumi.mergeOptions(opts, { version: utilities.getVersion()});
        }
        super(ServiceDeployment.__pulumiType, name, inputs, opts, true /*remote*/);
    }
}

/**
 * The set of arguments for constructing a ServiceDeployment resource.
 */
export interface ServiceDeploymentArgs {
    /**
     * Name of the image to deploy.
     */
    image: pulumi.Input<string>;
    /**
     * Namespace in which to push the deployment and service.
     */
    namespace?: pulumi.Input<string>;
    /**
     * Ports for service to listen on.
     */
    ports: pulumi.Input<pulumi.Input<number>[]>;
    /**
     * Number of replicas of the service to deploy.
     */
    replicas?: pulumi.Input<number>;
    /**
     * Service Type for K8s service. E.g. "LoadBalancer" or "ClusterIP"
     */
    serviceType?: pulumi.Input<string>;
}