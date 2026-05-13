# Prerequisites

This page lists the minimum prerequisites for running `quickstart.sh` successfully.

> Tested environments: Oracle Linux and MacBook (macOS).

## 1) Supported Platforms

- Minikube
- Oracle Cloud Infrastructure Container Engine for Kubernetes (OKE)

## 2) Common Prerequisites (Both Platforms)

Ensure the following command-line utilities are available in your environment:

- `git`
- `docker` **or** `podman`
- `kubectl`
- `helm`
- `istioctl`
- `jq`
- `openssl`
- `base64`
- `uname`
- `tput`
- `oci` (OCI CLI / Oracle Cloud CLI, recommended for registry login and OKE operations)
- `minikube` (required when running Minikube deployment)
- `java` / JDK (required for `keytool` in OKE TLS setup)
- `keytool` (required for OKE TLS setup)
- `sudo` (required for OKE TLS setup)

## 3) Platform-Specific Prerequisites

### Minikube

- `minikube` CLI installed and configured.
- Ability to run `minikube tunnel` in a separate terminal (requires sudo/root privileges for ports 80/443).
- CPU and memory requirements:
  - Minimum requirement: **5 CPU cores and 8 GB memory**
  - If deploying Oracle Database FREE edition on cluster: **6 CPU cores and 12 GB memory**
- **Note:** Minikube runs on the root file system by default. Ensure at least **30 GB** of free space is available on the root volume. If you are deploying the database on the cluster, ensure at least **50 GB** of free space.
- **Note (macOS + Rancher Desktop):** If you are using Rancher Desktop, go to **Preferences** and set **Memory = 16 GB** and **CPU = 6**.

### OKE

- Valid and reachable OKE cluster context in `kubectl`.
- Access to a container registry for image push/pull.
- Registry credentials (username/password) for Docker login and Kubernetes image pull secret creation.
- Additional tools required for OKE TLS flow:
  - `keytool`
  - `sudo`
- CPU and memory requirements:
  - Minimum requirement: **6 CPU cores (5 OCPU) and 12 GB memory**
  - If deploying Oracle Database FREE edition on cluster: **10 CPU cores (5 OCPU) and 12 GB memory**

## 4) Database Requirement

- Only **Oracle Database** is supported.
- Use your own Oracle Database (version **19c or above**).
- Recommended database version: **26ai**.
- For information on getting started with Oracle Database Free, see [Oracle Database Free Get Started](https://www.oracle.com/in/database/free/get-started/).

- The database user must be granted all of the following:
  - `CREATE SESSION`
  - `CREATE TABLE`
  - `CREATE PROCEDURE`
  - `CREATE VIEW`
  - `CREATE SEQUENCE`
  - `CREATE TYPE`

Grant example:

```sql
GRANT CREATE SESSION, CREATE TABLE, CREATE PROCEDURE, CREATE VIEW, CREATE SEQUENCE, CREATE TYPE TO database_user;
```

- Database can be configured in one of the following ways:
  1. Database deployed on the cluster itself (OKE or Minikube)
  2. Remote database with wallet (wallet ZIP extracted and full directory path ready)
  3. Remote database without wallet

> Warning: Deploying Oracle Database within cluster will take additional time (to pull and start the container) and will consume substantial cluster resources. For fastest startup and most predictable performance, using your own existing database is recommended.

## 5) Access and Permissions

You should have permissions to:

- Create namespaces, secrets, configmaps, and deployments in Kubernetes.
- Install/uninstall Helm releases.
- Install Istio (if not already installed).
- Update local truststore/hosts entries when prompted (OKE TLS flow).

## 6) Required Project Content

Run from the distribution root that contains:

- `quickstart.sh`
- `deployment-descriptors/`
- `coordinator/container-images/`
- `console/container-images/`
- `workflow-server/container-images/`
- `microtx-samples/` (or allow script to clone it)

## 7) Network Requirements

Allow network connectivity to required endpoints used by your chosen flow, including:

- Kubernetes image registries (for Minikube/Kubernetes image pull)
- OCI/registry endpoints (for OKE image push and pull)
- GitHub (if cloning `oracle-samples/microtx-samples`)

## 8) Recommended Pre-Run Checks

Before execution:

1. Verify current Kubernetes context: `kubectl config current-context`
2. Verify CLI versions: `kubectl version --client`, `helm version`, `istioctl version`, `minikube version` (if applicable)
3. Ensure you can run the script: `chmod +x quickstart.sh`

---

[← Back to Quickstart Home](./README.md)
