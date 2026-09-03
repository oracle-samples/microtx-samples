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

## Configuring Notification Service TxEventQ

TxEventQ viewing is disabled by default. To enable it, set the database values under `workflowSampleServices.notificationService.txeventq`. When enabled, the notification-service pod reads its `TXEVENTQ_USERNAME` and `TXEVENTQ_PASSWORD` environment variables from an existing `app-oracledb-secret` Secret in the release namespace. Do not commit database credentials in `values.yaml`; create the Secret in the same namespace used by `helm install`.

For a database that requires an Oracle wallet, create the wallet ConfigMap in the release namespace before installing the chart, then set `txeventq.hasWallet: true` and `txeventq.walletConfigMap` to its name. The chart mounts that ConfigMap read-only at `/app/wallet` by default. Configure `txeventq.jdbcUrl` to reference that in-container location, for example `...?wallet_location=/app/wallet`.

```sh
kubectl create configmap notification-db-wallet \
  -n <namespace> \
  --from-file=/path/to/Wallet_database

kubectl create secret generic app-oracledb-secret \
  -n <namespace> \
  --from-literal=username='<queue-owner-user>' \
  --from-literal=password='<password>'

helm install <release-name> ./workflow-sample-microservices \
  --set workflowSampleServices.notificationService.txeventq.enabled=true \
  --set workflowSampleServices.notificationService.txeventq.hasWallet=true \
  --set workflowSampleServices.notificationService.txeventq.walletConfigMap=notification-db-wallet \
  --set-string workflowSampleServices.notificationService.txeventq.jdbcUrl='jdbc:oracle:thin:@tcps://<host>:1522/<service>?wallet_location=/app/wallet'
```

The wallet ConfigMap is optional: when `txeventq.hasWallet` remains `false`, Helm renders neither the wallet volume nor its mount. Do not commit wallet files or their contents to this repository.

## Accessing Notification Service Through Istio

The chart creates an Istio VirtualService for the existing `microtx-gateway` in the release namespace. It preserves the notification-service context path, so requests beginning with `/notification-service` are sent unchanged to the service. For example:

```sh
curl http://<ingress-host>/notification-service/api/txeventq/messages
curl http://<ingress-host>/notification-service/api/txeventq/metadata
```

The VirtualService host list defaults to `*`; set `istio.hosts` to the hostname configured on the gateway when using a domain-specific or TLS Gateway. The chart also creates a `DestinationRule` that routes to the notification-service `v1` pod subset without imposing a TLS policy.

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
