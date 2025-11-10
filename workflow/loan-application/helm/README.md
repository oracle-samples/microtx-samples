# Helm Chart: workflow-sample-microservices

This chart deploys five workflow microservices:
- doc-process-mcp-server
- loan-compliance-service
- loan-processing-agent
- notification-service
- ocr-service

All manifests and deployment parameters (images, replica count, image pull secret) are configured in `workflow-sample-microservices/values.yaml`.

## Prerequisites

- Kubernetes cluster running (local or cloud)
- [Helm](https://helm.sh/) CLI installed
- Docker images for services are available in your cluster (ensure imagePullSecret as needed)

## Deploying the Helm Chart

1. Open a terminal and navigate to this `helm` directory.

2. Install the chart (replace `<release-name>` with a name you choose):

   ```sh
   helm install <release-name> ./workflow-sample-microservices -n otmm
   ```

   For example:
   ```sh
   cd /home/oracle/poc-services/poc-services/helm
   helm uninstall workflow-demo -n otmm
   helm install loan-app-demo ./workflow-sample-microservices -n otmm
   kw get pods
   
   cd /home/oracle/poc-services/poc-services/loan-processing-agent
   export BUILD_USING_MINIKUBE=true
   ```

3. To customize images, replica counts, or secrets, edit `workflow-sample-microservices/values.yaml` before installing, or override values inline:

   ```sh
   helm install <release-name> ./workflow-sample-microservices \
     --set workflowSampleServices.ocrService.image=myrepo/ocr-service:latest
   ```

## Uninstalling the Helm Chart

To remove the deployed release and all related resources:

```sh
helm uninstall <release-name>
```

Example:

```sh
helm uninstall workflow-demo -n otmm
```

This will delete all microservice deployments and services created by this Helm release.

---
For advanced Helm usage and troubleshooting, see [Helm documentation](https://helm.sh/docs/).
