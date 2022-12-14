"use strict";
// *** WARNING: this file was generated by Pulumi SDK Generator. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceDeployment = void 0;
const pulumi = require("@pulumi/pulumi");
const utilities = require("./utilities");
class ServiceDeployment extends pulumi.ComponentResource {
    /**
     * Create a ServiceDeployment resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name, args, opts) {
        let inputs = {};
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
        }
        else {
            inputs["frontEndIp"] = undefined /*out*/;
        }
        if (!opts.version) {
            opts = pulumi.mergeOptions(opts, { version: utilities.getVersion() });
        }
        super(ServiceDeployment.__pulumiType, name, inputs, opts, true /*remote*/);
    }
    /**
     * Returns true if the given object is an instance of ServiceDeployment.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    static isInstance(obj) {
        if (obj === undefined || obj === null) {
            return false;
        }
        return obj['__pulumiType'] === ServiceDeployment.__pulumiType;
    }
}
exports.ServiceDeployment = ServiceDeployment;
/** @internal */
ServiceDeployment.__pulumiType = 'k8s-servicedeployment:index:ServiceDeployment';
//# sourceMappingURL=serviceDeployment.js.map