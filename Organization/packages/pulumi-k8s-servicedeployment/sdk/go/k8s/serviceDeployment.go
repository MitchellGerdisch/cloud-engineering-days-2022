// *** WARNING: this file was generated by Pulumi SDK Generator. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

package k8s

import (
	"context"
	"reflect"

	"github.com/pkg/errors"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

type ServiceDeployment struct {
	pulumi.ResourceState

	// The front end IP
	FrontEndIp pulumi.StringOutput `pulumi:"frontEndIp"`
}

// NewServiceDeployment registers a new resource with the given unique name, arguments, and options.
func NewServiceDeployment(ctx *pulumi.Context,
	name string, args *ServiceDeploymentArgs, opts ...pulumi.ResourceOption) (*ServiceDeployment, error) {
	if args == nil {
		return nil, errors.New("missing one or more required arguments")
	}

	if args.Image == nil {
		return nil, errors.New("invalid value for required argument 'Image'")
	}
	if args.Ports == nil {
		return nil, errors.New("invalid value for required argument 'Ports'")
	}
	var resource ServiceDeployment
	err := ctx.RegisterRemoteComponentResource("k8s-servicedeployment:index:ServiceDeployment", name, args, &resource, opts...)
	if err != nil {
		return nil, err
	}
	return &resource, nil
}

type serviceDeploymentArgs struct {
	// Name of the image to deploy.
	Image string `pulumi:"image"`
	// Namespace in which to push the deployment and service.
	Namespace *string `pulumi:"namespace"`
	// Ports for service to listen on.
	Ports []float64 `pulumi:"ports"`
	// Number of replicas of the service to deploy.
	Replicas *float64 `pulumi:"replicas"`
	// Service Type for K8s service. E.g. "LoadBalancer" or "ClusterIP"
	ServiceType *string `pulumi:"serviceType"`
}

// The set of arguments for constructing a ServiceDeployment resource.
type ServiceDeploymentArgs struct {
	// Name of the image to deploy.
	Image pulumi.StringInput
	// Namespace in which to push the deployment and service.
	Namespace pulumi.StringPtrInput
	// Ports for service to listen on.
	Ports pulumi.Float64ArrayInput
	// Number of replicas of the service to deploy.
	Replicas pulumi.Float64PtrInput
	// Service Type for K8s service. E.g. "LoadBalancer" or "ClusterIP"
	ServiceType pulumi.StringPtrInput
}

func (ServiceDeploymentArgs) ElementType() reflect.Type {
	return reflect.TypeOf((*serviceDeploymentArgs)(nil)).Elem()
}

type ServiceDeploymentInput interface {
	pulumi.Input

	ToServiceDeploymentOutput() ServiceDeploymentOutput
	ToServiceDeploymentOutputWithContext(ctx context.Context) ServiceDeploymentOutput
}

func (*ServiceDeployment) ElementType() reflect.Type {
	return reflect.TypeOf((*ServiceDeployment)(nil))
}

func (i *ServiceDeployment) ToServiceDeploymentOutput() ServiceDeploymentOutput {
	return i.ToServiceDeploymentOutputWithContext(context.Background())
}

func (i *ServiceDeployment) ToServiceDeploymentOutputWithContext(ctx context.Context) ServiceDeploymentOutput {
	return pulumi.ToOutputWithContext(ctx, i).(ServiceDeploymentOutput)
}

func (i *ServiceDeployment) ToServiceDeploymentPtrOutput() ServiceDeploymentPtrOutput {
	return i.ToServiceDeploymentPtrOutputWithContext(context.Background())
}

func (i *ServiceDeployment) ToServiceDeploymentPtrOutputWithContext(ctx context.Context) ServiceDeploymentPtrOutput {
	return pulumi.ToOutputWithContext(ctx, i).(ServiceDeploymentPtrOutput)
}

type ServiceDeploymentPtrInput interface {
	pulumi.Input

	ToServiceDeploymentPtrOutput() ServiceDeploymentPtrOutput
	ToServiceDeploymentPtrOutputWithContext(ctx context.Context) ServiceDeploymentPtrOutput
}

type serviceDeploymentPtrType ServiceDeploymentArgs

func (*serviceDeploymentPtrType) ElementType() reflect.Type {
	return reflect.TypeOf((**ServiceDeployment)(nil))
}

func (i *serviceDeploymentPtrType) ToServiceDeploymentPtrOutput() ServiceDeploymentPtrOutput {
	return i.ToServiceDeploymentPtrOutputWithContext(context.Background())
}

func (i *serviceDeploymentPtrType) ToServiceDeploymentPtrOutputWithContext(ctx context.Context) ServiceDeploymentPtrOutput {
	return pulumi.ToOutputWithContext(ctx, i).(ServiceDeploymentPtrOutput)
}

// ServiceDeploymentArrayInput is an input type that accepts ServiceDeploymentArray and ServiceDeploymentArrayOutput values.
// You can construct a concrete instance of `ServiceDeploymentArrayInput` via:
//
//          ServiceDeploymentArray{ ServiceDeploymentArgs{...} }
type ServiceDeploymentArrayInput interface {
	pulumi.Input

	ToServiceDeploymentArrayOutput() ServiceDeploymentArrayOutput
	ToServiceDeploymentArrayOutputWithContext(context.Context) ServiceDeploymentArrayOutput
}

type ServiceDeploymentArray []ServiceDeploymentInput

func (ServiceDeploymentArray) ElementType() reflect.Type {
	return reflect.TypeOf(([]*ServiceDeployment)(nil))
}

func (i ServiceDeploymentArray) ToServiceDeploymentArrayOutput() ServiceDeploymentArrayOutput {
	return i.ToServiceDeploymentArrayOutputWithContext(context.Background())
}

func (i ServiceDeploymentArray) ToServiceDeploymentArrayOutputWithContext(ctx context.Context) ServiceDeploymentArrayOutput {
	return pulumi.ToOutputWithContext(ctx, i).(ServiceDeploymentArrayOutput)
}

// ServiceDeploymentMapInput is an input type that accepts ServiceDeploymentMap and ServiceDeploymentMapOutput values.
// You can construct a concrete instance of `ServiceDeploymentMapInput` via:
//
//          ServiceDeploymentMap{ "key": ServiceDeploymentArgs{...} }
type ServiceDeploymentMapInput interface {
	pulumi.Input

	ToServiceDeploymentMapOutput() ServiceDeploymentMapOutput
	ToServiceDeploymentMapOutputWithContext(context.Context) ServiceDeploymentMapOutput
}

type ServiceDeploymentMap map[string]ServiceDeploymentInput

func (ServiceDeploymentMap) ElementType() reflect.Type {
	return reflect.TypeOf((map[string]*ServiceDeployment)(nil))
}

func (i ServiceDeploymentMap) ToServiceDeploymentMapOutput() ServiceDeploymentMapOutput {
	return i.ToServiceDeploymentMapOutputWithContext(context.Background())
}

func (i ServiceDeploymentMap) ToServiceDeploymentMapOutputWithContext(ctx context.Context) ServiceDeploymentMapOutput {
	return pulumi.ToOutputWithContext(ctx, i).(ServiceDeploymentMapOutput)
}

type ServiceDeploymentOutput struct {
	*pulumi.OutputState
}

func (ServiceDeploymentOutput) ElementType() reflect.Type {
	return reflect.TypeOf((*ServiceDeployment)(nil))
}

func (o ServiceDeploymentOutput) ToServiceDeploymentOutput() ServiceDeploymentOutput {
	return o
}

func (o ServiceDeploymentOutput) ToServiceDeploymentOutputWithContext(ctx context.Context) ServiceDeploymentOutput {
	return o
}

func (o ServiceDeploymentOutput) ToServiceDeploymentPtrOutput() ServiceDeploymentPtrOutput {
	return o.ToServiceDeploymentPtrOutputWithContext(context.Background())
}

func (o ServiceDeploymentOutput) ToServiceDeploymentPtrOutputWithContext(ctx context.Context) ServiceDeploymentPtrOutput {
	return o.ApplyT(func(v ServiceDeployment) *ServiceDeployment {
		return &v
	}).(ServiceDeploymentPtrOutput)
}

type ServiceDeploymentPtrOutput struct {
	*pulumi.OutputState
}

func (ServiceDeploymentPtrOutput) ElementType() reflect.Type {
	return reflect.TypeOf((**ServiceDeployment)(nil))
}

func (o ServiceDeploymentPtrOutput) ToServiceDeploymentPtrOutput() ServiceDeploymentPtrOutput {
	return o
}

func (o ServiceDeploymentPtrOutput) ToServiceDeploymentPtrOutputWithContext(ctx context.Context) ServiceDeploymentPtrOutput {
	return o
}

type ServiceDeploymentArrayOutput struct{ *pulumi.OutputState }

func (ServiceDeploymentArrayOutput) ElementType() reflect.Type {
	return reflect.TypeOf((*[]ServiceDeployment)(nil))
}

func (o ServiceDeploymentArrayOutput) ToServiceDeploymentArrayOutput() ServiceDeploymentArrayOutput {
	return o
}

func (o ServiceDeploymentArrayOutput) ToServiceDeploymentArrayOutputWithContext(ctx context.Context) ServiceDeploymentArrayOutput {
	return o
}

func (o ServiceDeploymentArrayOutput) Index(i pulumi.IntInput) ServiceDeploymentOutput {
	return pulumi.All(o, i).ApplyT(func(vs []interface{}) ServiceDeployment {
		return vs[0].([]ServiceDeployment)[vs[1].(int)]
	}).(ServiceDeploymentOutput)
}

type ServiceDeploymentMapOutput struct{ *pulumi.OutputState }

func (ServiceDeploymentMapOutput) ElementType() reflect.Type {
	return reflect.TypeOf((*map[string]ServiceDeployment)(nil))
}

func (o ServiceDeploymentMapOutput) ToServiceDeploymentMapOutput() ServiceDeploymentMapOutput {
	return o
}

func (o ServiceDeploymentMapOutput) ToServiceDeploymentMapOutputWithContext(ctx context.Context) ServiceDeploymentMapOutput {
	return o
}

func (o ServiceDeploymentMapOutput) MapIndex(k pulumi.StringInput) ServiceDeploymentOutput {
	return pulumi.All(o, k).ApplyT(func(vs []interface{}) ServiceDeployment {
		return vs[0].(map[string]ServiceDeployment)[vs[1].(string)]
	}).(ServiceDeploymentOutput)
}

func init() {
	pulumi.RegisterOutputType(ServiceDeploymentOutput{})
	pulumi.RegisterOutputType(ServiceDeploymentPtrOutput{})
	pulumi.RegisterOutputType(ServiceDeploymentArrayOutput{})
	pulumi.RegisterOutputType(ServiceDeploymentMapOutput{})
}
