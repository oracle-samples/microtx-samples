# Quick Start with Minikube

This page describes the positive execution flow for running `quickstart.sh` on Minikube.

## 1) About This Procedure

Use this flow to deploy:

- Oracle MicroTx components (coordinator, console, workflow-server)
- Optional loan sample microservices
- Optional loan workflow definitions and connector profiles

This procedure is based on an observed successful run.

## 2) Before You Begin

1. Complete all requirements in [Prerequisites](./prerequisites.md).
2. Open a terminal at the distribution root (where `quickstart.sh` is present).
3. Ensure script is executable:

```bash
chmod +x quickstart.sh
```

## 3) Run the Script

```bash
./quickstart.sh
```

You should see the MicroTx quickstart banner and platform selection prompt.

## 4) Step-by-Step Interactive Flow

### Step 1: Select platform

At the platform prompt, select:

```text
1) Minikube
2) Oracle Cloud Infrastructure Container Engine for Kubernetes (OKE)
#? 1
```

### Step 2: Acknowledge non-TLS warning for Minikube path

```text
Warning: MicroTx deployment will run without TLS. Do you want to continue?
1) Yes
2) No
#? 1
```

### Step 3: Script validates runtime and sample path

Example observed output:

```text
Using podman as container runtime engine. Containers will run in host network mode.

***** Samples directory *****
Using ./microtx-samples as samples directory
```

### Step 4: Choose Minikube resource profile

Based on the resources allocation make the choice, for default resource allocation to minikube select 2:

```text
Do you want to configure minikube with CPU: 6 and Memory: 12288 MB?
1) Yes
2) No
#? 2

Using Minikube default configuration: CPUs = 4 and Memory = 8192 MB
```

### Step 5: Start Minikube, set context, and install Istio automatically

The script starts Minikube, confirms context, and then checks/installs Istio automatically (if not already present). It also verifies Istio pod readiness before moving forward.

Observed output excerpt:

```text
Starting minikube.
...
Current Minikube context is minikube.

Istio is not installed in the cluster. Installing istio.
...
Checking if all Istio pods are running...
Istio pods are running fine...proceeding further
```

*(No action required)*


### Step 6: Minikube Tunnel (manual terminal)

The script requires you to **open a new terminal tab and run**:

The script requires you to open a new terminal tab and run:

1. `export KUBECONFIG=<KUBECONFIG_PATH>`
2. `minikube tunnel` - To start a tunnel to Istio ingress gateway. If prompted for password, enter the system password.

> Note: Copy the actual `KUBECONFIG` path from the script output above. The path shown here is an example.

In **new terminal**:

```bash
export KUBECONFIG=<KUBECONFIG_PATH>
minikube tunnel
```

You might see:

```text
Status:
    machine: minikube
    pid: 1787043
    route: 10.96.0.0/12 -> 192.0.0.0
    minikube: Running
    services: [istio-ingressgateway]
```

If it fails, run with `sudo` in the same terminal. The `sudo` context should persist in the terminal tab where the tunnel is started.

```bash
export KUBECONFIG=<KUBECONFIG_PATH>
sudo minikube tunnel
```

If you still face config file errors, run:

```bash
minikube update-context
export KUBECONFIG=<KUBECONFIG_PATH>
minikube tunnel
```

Keep this terminal open as long as the cluster runs.

Return to the main script terminal and press Enter to continue:

```text
Once the steps are completed, press enter key to continue
Waiting for Istio-ingressgateway loadbancer to be provisioned...
Istio-ingressgateway url is http://10.96.0.0:80
```

Example ingress URL output:

```text
Istio-ingressgateway url is http://127.0.0.1:80
```

### Step 7: Create namespace and enable Istio injection

```text
Creating a namespace 'otmm' for deployment.namespace/otmm created
Adding label 'istio-injection=enabled' to namespace 'otmm' ... namespace/otmm labeled
```

### Step 8: Configure Oracle Database connectivity

Follow the guided prompts to configure Oracle Database as persistence.
You will be prompted for:

1. Oracle persistence username and password
2. Wallet (if required). 
    Note: Remote database with wallet (wallet ZIP extracted and full directory path ready)
3. JDBC URL
    Example:
```
    jdbc:oracle:thin:@//<host>:<port>/<service_name>
```
Ensure that database connection properties, such as retry count and connection timeout, are configured in the JDBC connection string.

NOTE:
    ```
    <JDBC_URL?retry_count=20&retry_delay=3&connection_timeout=30000&tcp_keepalive=true
    ```

Example prompt sequence:

```text
Select Oracle Database deployment option:
1) Deploy Oracle Database on cluster
2) Use your own Oracle Database
#? 2

Does your Oracle Database require a wallet for connection?
1) Yes
2) No
#? 1
```

### Step 9: Create required Kubernetes secrets

Example observed output:

```text
configmap/oracle-db-wallet-configmap created
secret/oracledb-credentials created
secret/encryption-secret created
secret/console-cookie-encryption-password-secret created
```

*(No action required)*

### Step 10: Load MicroTx images and install Helm chart

The script loads coordinator, console, and workflow-server images into Minikube and installs the `otmm` Helm release.

Observed success message:

```text
helm chart otmm successfully installed in otmm namespace
```

The script then waits until key pods are fully ready.

```text
NAME                               READY   STATUS    RESTARTS   AGE
otmm-console-767b665c66-44j2x      2/2     Running   0          113s
otmm-tcs-0                         2/2     Running   0          113s
workflow-server-646b5fc764-j42h2   2/2     Running   0          113s
```

*(No action required)*

### Step 11: Deploy sample loan application services

Optionally install loan-application sample services and workflow present [here](https://github.com/oracle-samples/microtx-samples/tree/main/workflow/loan-application).
This will build the sample app dependent microservices, deploy it on minikube.

```text
Would you like to install sample loan-application services on cluster?
1) Yes
2) No
#? 1
```

Default behavior observed:

```text
Building sample app images from source.
```

After builds, Helm deploys `loan-app-demo` and reports `STATUS: deployed`.

```text
NAME                                       READY   STATUS    RESTARTS   AGE
doc-process-mcp-server-7bb5d4b457-6drcv    2/2     Running   0          32s
loan-compliance-service-5bb66974df-x6dz4   2/2     Running   0          32s
loan-processing-agent-7484847c48-tv7kq     2/2     Running   0          32s
notification-service-85846fcf89-zb598      2/2     Running   0          32s
ocr-service-5896c78b8d-x6t62               2/2     Running   0          32s
otmm-console-767b665c66-44j2x              2/2     Running   0          4m32s
otmm-tcs-0                                 2/2     Running   0          4m32s
workflow-server-646b5fc764-j42h2           2/2     Running   0          4m32s
```

### Step 12: Deploy loan workflow definitions

After deploying [loan application](https://github.com/oracle-samples/microtx-samples/tree/main/workflow/loan-application) sample app and configure workflows. 
On selecting **Yes** script cleans up existing workflow and configures the one present in github.

```text
Do you want to deploy the loan application workflow in the workflow server?
1) Yes
2) No
#? 1
...
✅ Loan application workflow deployed successfully
```

## 5) Validate Deployment

The script performs readiness checks and prints pod status.

Observed healthy state included:

You can manually verify:

```bash
kubectl get pods -n otmm
```

```text
NAME                                       READY   STATUS    RESTARTS   AGE
doc-process-mcp-server-7bb5d4b457-6drcv    2/2     Running   0          32s
loan-compliance-service-5bb66974df-x6dz4   2/2     Running   0          32s
loan-processing-agent-7484847c48-tv7kq     2/2     Running   0          32s
notification-service-85846fcf89-zb598      2/2     Running   0          32s
ocr-service-5896c78b8d-x6t62               2/2     Running   0          32s
otmm-console-767b665c66-44j2x              2/2     Running   0          4m32s
otmm-tcs-0                                 2/2     Running   0          4m32s
workflow-server-646b5fc764-j42h2           2/2     Running   0          4m32s
```

## 6) Access the Console

Observed URL:

```text
Open this URL in browser: http://127.0.0.1:80/consoleui/
```
NOTE: 127.0.0.1 can be the assigned istio-ingress IP address

## 7) End-of-Run Cleanup Prompts

At script end, you are prompted to optionally uninstall:

1. Loan application release
2. MicroTx deployment
3. Minikube cluster

## 8) Notes for Next Iterations

- If your environment prints different URLs/IPs or image tags, keep those values from your runtime output.
- This page can be updated incrementally with additional environment-specific output samples.

---

[← Back to Quickstart Home](./README.md)
