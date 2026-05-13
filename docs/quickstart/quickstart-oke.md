# Quick Start with OKE

This guide provides step-by-step instructions for deploying MicroTx on [Oracle Cloud Infrastructure Container Engine for Kubernetes (OKE)](https://docs.oracle.com/en-us/iaas/Content/ContEng/home.htm) using `quickstart.sh`.

## 1) About This Procedure

Use this flow to deploy:

- Oracle MicroTx components on OKE
- Optional Istio dashboards (Kiali/Jaeger)
- Optional loan sample microservices
- Optional loan workflow definitions

## 2) Before You Begin

1. Complete all requirements in [Prerequisites](./prerequisites.md).
2. Confirm your `kubectl` context points to the target OKE cluster.
3. Ensure script is executable:

```bash
chmod +x quickstart.sh
```

## OKE Cluster and Registry Requirements

**Kubernetes Cluster:**
- An OKE cluster up and running.
- Ensure `kubectl` is configured to target your OKE cluster.

**Container Registry (OCIR):**
- Registry URL (e.g., `iad.ocir.io`)
- registry namespace (tenancy-namespace)
- Your OKE cluster should have access to an external Oracle Cloud Container Registry (OCIR)

**Metrics Server:**
- Install metrics server by following this [document](https://docs.oracle.com/en/database/oracle/transaction-manager-for-microservices/24.2/tmmdg/deploy-metric-server.html)
- Check if metrics server is already installed using below command
  ```{code}
    kubectl get pods -n kube-system | grep metrics-server
    metrics-server-7fbb699795-htmjg    1/1     Running   0              10m
  ```
  ```
  kubectl top pods
  ```

## Initial Container Registry Setup

1. **Log in to Oracle Container Registry (Optional):**

   Before running the script, verify that you can authenticate and push images to OCIR.

   ```bash
   docker login iad.ocir.io   # Replace with your OCIR region
   ```

   You will enter your OCIR username and an auth token as the password.

2. **Ensure Kubeconfig Points to OKE:**

   ```bash
   kubectl config use-context <your-oke-context>
   kubectl get nodes
   ```

---

## 3) Run the Script

```bash
./quickstart.sh
```

## 4) Step-by-Step Interactive Flow

### Step 1: Select OKE platform

At the platform prompt, select option 2 to install on OKE:

```text
1) Minikube
2) Oracle Cloud Infrastructure Container Engine for Kubernetes (OKE)
#? 2
```

### Step 2: Validate software and environment prerequisites

The script validates required tools for OKE flow, including:

- `kubectl`, `helm`, `istioctl`
- container engine (`docker` or `podman`)
- `keytool` and `sudo` (for TLS trust setup)

### Step 3: Resolve sample directory

The script uses `./microtx-samples` if present. If not available, it can clone the [samples repository](https://github.com/oracle-samples/microtx-samples).

*(No action required)*

### Step 4: Install/validate Istio and ingress endpoint

The script:

1. Checks for `istio-system` namespace.
2. Installs Istio if not present.
3. Verifies Istio pods are running.
4. Waits for ingress load balancer IP.

For OKE TLS flow, the script also:

- Creates/refreshes local self-signed certificates.
- Updates Java truststore using `keytool`.
- Creates TLS secret in `istio-system`.

Expected ingress URL style:

```text
https://demo.microtx.dev:443
```

### Step 5: (Optional) Istio dashboards

For OKE, the script can install or reuse Kiali/Jaeger dashboards.

### Step 6: Create namespace and enable Istio injection

The script ensures namespace `otmm` exists and applies:

- `istio-injection=enabled`

### Step 7: Configure Oracle Database settings

Choose one option:

1. Deploy Oracle Database on cluster
2. Use your own Oracle Database

Then provide required values:

- Database username
- Database password
- JDBC connection string
- Wallet requirement and wallet path (if applicable)

The script creates required DB resources (secret/configmap).

   ```
   Select Oracle Database deployment option:

   Note: Deploying Oracle Database on the cluster requires a minimum of 2 CPUs and 4GB of memory for stable operation.
   1) Deploy Oracle Database on cluster
   2) Use your own Oracle Database
   #? [user selects 1 or 2]
   ```
**option 2** If using own Oracle DB (option 2), workflow continues:
```
    Using user owned Oracle Database configuration

    Does your Oracle Database require a wallet for connection?
    1) Yes
    2) No
    #? 1

    Provide the downloaded and extracted wallet location of the database.
    Example: /Users/microtx/Downloads/wallet_directory: /home/otmmdev01/Database_Wallet2
    configmap/oracle-db-wallet-configmap created

    Enter the username to be used for MicroTx Persistence: microtx_local2

    Enter the password for MicroTx Persistence (password will not appear on the screen):
    Enter the Connection String for MicroTx Persistence

    Connection String (JDBC). (Example: jdbc:oracle:thin:@//oracle-db-oracle-db23c-free.oracledb-free.svc.cluster.local:1521/FREEPDB1): jdbc:oracle:thin:@tcps://adb.us-phoenix-1.oraclecloud.com:1522/abc.adb.oraclecloud.com
```

Ensure that database connection properties, such as retry count and connection timeout, are configured in the JDBC connection string.

**<JDBC_URL?retry_count=20&retry_delay=3&connection_timeout=30000&tcp_keepalive=true**


**option 1** If you want to deploy free Oracle DB on cluster (option 1), workflow continues:

You are prompted for Oracle username and a suitable password:
```
Enter the username to be used for MicroTx Persistence: microtx
Enter the password for MicroTx Persistence. Oracle recommends at least 8 characters with uppercase, lowercase, and a digit; this password will be used for SYS, SYSTEM, and PDBADMIN accounts.
Password will not appear on the screen:
```
**If you enter an invalid password (e.g., missing digit), you'll be prompted again.**

Pods are then created:
```
namespace/oracledb-free created

Waiting for pod oracle-db-oracle-db23c-free-0 to be ready and running... (several times)
Pod oracle-db-oracle-db23c-free-0 is ready and running in 'oracledb-free' namespace.
...
secret/oracledb-credentials created
secret/regcred created
```
Monitor readiness:
```sh
kubectl get pods -n oracledb-free -w
```
---

### Step 8: Create OKE image pull secret

Provide:

- Registry server (for example `us-ashburn-1.ocir.io`)
- Registry prefix (tenancy namespace/repository path)
  Example 1: `us-ashburn-1.ocir.io/<tenancy-namespace>`
  Example 2: `us-ashburn-1.ocir.io/<tenancy-namespace>/<repo-name>`
- Registry username
- Registry password

For more information about container registry, see https://docs.oracle.com/iaas/Content/Registry/Concepts/registryconcepts.htm

The script then:

1. Logs into registry
2. Creates/uses Kubernetes docker-registry secret `regcred` in `otmm`

### Step 9: Create workflow and console secrets

The script creates/refreshes:

- `encryption-secret` (if missing)
- `console-cookie-encryption-password-secret`

   *(No action required)*

### Step 10: Select image architecture and load images

Select architecture for this run:

- AMD (x86_64)
- ARM (arm64)

The choice is used for coordinator, workflow-server, and console images to be tagged and pushed to container registry.

### Step 11: Tag and push images to registry

The script tags and pushes images using your registry prefix, for example:

- `<CLUSTER_PREFIX>/transaction-coordinator:<VERSION>`
- `<CLUSTER_PREFIX>/workflow-server:<VERSION>`
- `<CLUSTER_PREFIX>/console:<VERSION>`

*(No action required)*

### Step 12: Install MicroTx Helm release

The script installs Helm release `otmm` in namespace `otmm` with OKE values and runtime overrides such as:

- DB configuration and secret references
- registry image paths
- image pull secret (`regcred`)
- Istio host settings
- TLS ingress settings

Then it waits for readiness of:

- `otmm-tcs`
- `otmm-console`
- `workflow-server`

```
NAME                              READY   STATUS    RESTARTS   AGE
otmm-console-7c6446756b-j6gbk     2/2     Running   0          117s
otmm-tcs-0                        2/2     Running   0          117s
workflow-server-f8b74c5f7-sqq84   2/2     Running   0          117s
```

*(No action required)*

### Step 13: Deploy sample loan application services (optional)

Optionally install loan-application sample services and workflow present [here](https://github.com/oracle-samples/microtx-samples/tree/main/workflow/loan-application).
This will build the sample app dependent microservices, deploy it on OKE.

If selected, the script can:

- Build sample app images (or load offline images if enabled)
- Push sample images to registry
- Install Helm release `loan-app-demo`
- Validate sample pod readiness

```
Would you like to install sample loan-application services on cluster?
1) Yes
2) No
#? 1
```
On deploymen of sample applications
```
NAME                                       READY   STATUS    RESTARTS   AGE
doc-process-mcp-server-6bb89b8c84-gl8fm    2/2     Running   0          2m18s
loan-compliance-service-7f65c5fb8d-mwwxw   2/2     Running   0          2m18s
loan-processing-agent-6d4d7b475f-7f7hl     2/2     Running   0          2m18s
notification-service-557b8944fb-nhg9f      2/2     Running   0          2m18s
ocr-service-694f46c67f-jrvpx               2/2     Running   0          2m18s
otmm-console-7c6446756b-j6gbk              2/2     Running   0          6m47s
otmm-tcs-0                                 2/2     Running   0          6m47s
workflow-server-f8b74c5f7-sqq84            2/2     Running   0          6m47s
```

### Step 14: Deploy loan workflow content (optional)

If selected, the script runs:

- `microtx-samples/workflow/loan-application/deploy_loan_application_wf.sh`

This deploys/refreshes workflow definitions, connector profiles, prompts, and related assets.

```
Do you want to deploy the loan application workflow in the workflow server?
This includes workflow definition, prompts, connecters etc.
Reference: https://github.com/oracle-samples/microtx-samples/tree/topic/develop/workflow/loan-application
1) Yes
2) No
#? 1
```

## 5) Validate Deployment

Run:

```bash
kubectl get pods -n otmm
helm list -n otmm
```

Expected state:

- MicroTx core pods are `Running` and fully ready.
- Optional sample app pods are `Running` and fully ready.
- Helm releases show `deployed` status.

## 6) Access the Console UI

For OKE, the script prints both HTTPS and HTTP style URLs:

```text
https://demo.microtx.dev:443/consoleui/
http://<oke_ingress_public_ip>:80/consoleui/
```

Use the URL applicable to your TLS/network setup.

## 7) End-of-Run Cleanup Prompts

At script end, you may be prompted to uninstall:

1. Loan application deployment
2. MicroTx deployment
3. Dashboard services (Kiali/Jaeger)
4. Istio

Choose based on whether you want to retain the environment.

---

[← Back to Quickstart Home](./README.md)
