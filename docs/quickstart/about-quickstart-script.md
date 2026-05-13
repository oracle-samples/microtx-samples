# About the `quickstart.sh` Script

The `quickstart.sh` script is an interactive automation utility for deploying Oracle MicroTx in Kubernetes-based environments.

## What This Script Automates

At a high level, the script can perform the following operations in a guided flow:

1. Platform selection (Minikube or OKE).
2. Prerequisite validation.
3. MicroTx sample repository discovery.
4. Istio installation and ingress readiness checks.
5. Namespace preparation (`otmm`) and Istio injection labeling.
6. Oracle Database configuration (cluster deployment or existing database).
7. Secret/configuration setup for:
   - Oracle DB credentials
   - Workflow encryption
   - Console cookie encryption
   - OKE image pull secret (when applicable)
8. MicroTx image load/tag/push and Helm deployment.
9. Loan sample application image build/deploy.
10. Loan application workflow deployment.
11. Console URL output and optional cleanup prompts.

## Supported Platforms in Script

- **Minikube**
- **Oracle Cloud Infrastructure Container Engine for Kubernetes (OKE)**

## Runtime Artifacts

The script creates and/or updates several local artifacts during execution.

- `microtx_quickstart_history.log`  
  Stores reusable non-sensitive input values for future runs.

- `oracledb_deployment.log`  
  Captures Oracle DB Helm deployment command output (when DB is deployed in-cluster).

- Temporary files under resource paths  
  Used for generated secrets/manifests and intermediate substitutions.

## Input Reuse Capability

If `microtx_quickstart_history.log` exists, the script can reuse previously entered values after user confirmation. Sensitive password values are excluded from persistence.

## Scope of This Documentation Set

This documentation set focuses on the **positive execution path** to help end users complete a successful installation with minimal friction.

---

[← Back to Quickstart Home](./README.md)
