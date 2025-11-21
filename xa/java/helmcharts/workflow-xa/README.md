# Workflow-XA Sample Helm Charts

This repository includes two Helm charts for deploying the Workflow-XA sample application on Kubernetes/Minikube, illustrating multi-service XA transaction management use cases.

---

## Building the Department Services

Before deploying, you need to build and containerize the department services:

- **Helidon MP-based service:** See [../../department-helidon/README.md](../../department-helidon/README.md) for build and setup details.
- **Spring Boot-based service:** See [../../department-spring/README.md](../../department-spring/README.md) for build and setup details.



---

## Chart Variants

1. **Istio Service Mesh**  
   - Location: [`istio/transfer`](istio/transfer)  
   - Deploys the application behind an Istio Gateway, leveraging Istio service mesh features.

2. **NGINX LoadBalancer (No Service Mesh)**  
   - Location: [`k8s/transfer`](k8s/transfer)  
   - Uses a standard NGINX Ingress or Kubernetes LoadBalancer, without Istio.

Both charts share the same configuration options in their `values.yaml`.

---

## Key `values.yaml` Fields

Only the following fields require mandatory attention and are described below. All other fields can be used with their defaults or edited as per standard Helm app conventions.

| Field                             | Description                                                                                                                                                                                                      |
|-----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **connectString** | JDBC connection string for the department's database. </br>**Example:**<br>`jdbc:oracle:thin:@tcps://<host>:<port>/<service_name>?wallet_location=Database_Wallet`|
| **databaseUser**                  | Database username for the department/application instance. This will be used for JDBC authentication.                                                                                           |
| **databasePassword**              | Password corresponding to `databaseUser`. For security, prefer using Kubernetes secrets or Helm `--set` overrides instead of plaintext.                                                             |
| **imagePullSecret**               | The name of a Kubernetes secret for pulling container images from a private or authenticated registry. If your image repo requires authentication, you must create and reference this secret in your namespace.  |

Update the above values for each departmental app in your `sampleapps` mapping.

---

## Installation

### Install with Istio Service Mesh

```sh
helm install workflow-xa-istio istio/transfer -n <namespace>
```

### Install with NGINX LoadBalancer

```sh
helm install workflow-xa-nginx k8s/transfer -n <namespace>
```

Refer to the chart's `values.yaml` to set the above-required fields for your databases and container registry.

---

## Testing the Deployment

After deploying the Helm chart, verify your services are running by querying the department APIs:

- **Department 1 balance query:**  
  `http://<LoadBalancer-Host-IP>/dept1/account1`

- **Department 2 balance query:**  
  `http://<LoadBalancer-Host-IP>/dept2/account1`



---
