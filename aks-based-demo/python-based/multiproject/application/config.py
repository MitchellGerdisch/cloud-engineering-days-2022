from pulumi import Config, StackReference, get_organization, get_stack

config = Config()
base_name = config.get("baseName") or "app"
service_name = config.get("serviceName") or "ship-manager"

base_infra_project = config.require("baseInfraproject")
base_infra_stack = StackReference(f"{get_organization()}/{base_infra_project}/{get_stack()}")
kubeconfig = base_infra_stack.get_output("kubeconfig")
db_name = base_infra_stack.get_output("mongodb_name")
db_connection_string = base_infra_stack.get_output("mongodb_connection_string")
service_ip = base_infra_stack.get_output("service_ip")

