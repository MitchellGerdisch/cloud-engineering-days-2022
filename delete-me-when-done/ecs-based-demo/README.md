# Cloud Engineering Days - 2022
Code examples used for the "Infrastructure as Code Best Practices" session.

## Developer
* Smaller stack with an RDS that creates or consumes a password and outputs it.
* Different stacks with different RDS configs (redundant or not, instance size, password configured or not).
* real time coding of the last mile or so with .... or iterative coding as I tinker with security group or something.

## Team
* Add in rest of the whole thing and split stacks between base infra and app with ultimate intent that it's not just a wordpress app that gets deployed
* Start putting chunks of code into reusable components.
* Unit testing
* CI/CD with branch-specific or PR-specific stacks and PR with previews against prod 

## Organization
* Policy  as code
* MLC packages for, say the app deployment component to support different teams in different languages