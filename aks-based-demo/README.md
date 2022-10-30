# Azure AKS-Cosmos DB Workshop
This repo contains the Pulumi code used for the Azure AKS-Comsos DB workshop held Sept 28, 2022.

The project represents a Pulumi-fication of this Azure MongoDB and AKS tutorial that deploys a "Ship Management" system: 
https://learn.microsoft.com/en-us/training/modules/aks-manage-application-state/

# Repo Structure
## components folder
This folder contains Pulumi Component Resources. Component resources are used to create reusable abstractions that represent sets of resources. 

The components folder contains moduels for:
* aks: abstraction for deploying an AKS cluster and related resources.
* cosmos: abstraction for deploying Cosmos MongoDB and related resources.
* ingress_ctl: abstraction for deploying an ingress controller on the kubernetes cluster.

## monoproject folder
This folder contains a single Pulumi project that deploys the entire Ship Management system in a single stack.

## multiproject folder
This folder also deploys the Ship Management system. But it does so using two stacks. 
* base-infra project: Deploys Cosmos, AKS and Ingress Controller
* application project: Deploys the Ship Management solution onto the resources deployed by base-infra.

## Usage
* cd to monoproject or multiproject/base-infra and then multiproject/application
* `python3 -m venv venv`
* `source ./venv/bin/activate`
* `pip install -r requirements.txt`
* `pulumi up`


