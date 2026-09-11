---
title: Deploy Oracle MicroTx Free on OCI with Oracle Cloud Marketplace
description: Provision a new Oracle Kubernetes Engine cluster and deploy MicroTx Free using the Oracle Cloud Marketplace Terraform stack.
date: 2026-08-10
updated: 2026-08-13
author: BHARATH MC
author_id: bharath-mc
tags:
  - MicroTx
  - OCI
  - OKE
  - Oracle Cloud Marketplace
  - Terraform
---

Oracle Cloud Marketplace provides a guided route to deploy Oracle MicroTx Free in Oracle Cloud Infrastructure (OCI). The Marketplace stack uses Terraform to provision the required OCI resources, create a new Oracle Kubernetes Engine (OKE) cluster, and deploy MicroTx to that cluster. It does not deploy to an existing OKE cluster.

## Before you begin

Prepare an OCI account with permissions to provision the required OCI resources, including a new OKE cluster and related networking. Complete the <a href="https://docs.oracle.com/en/database/oracle/transaction-manager-for-microservices/26.1/tmmmg/prerequisites.html" target="_blank" rel="noopener noreferrer">prerequisites</a> and review the <a href="https://docs.oracle.com/en/database/oracle/transaction-manager-for-microservices/26.1/tmmmg/minimum-resource-requirements.html" target="_blank" rel="noopener noreferrer">minimum resource requirements</a> for the complete Terraform stack, including OKE worker nodes, the database, load balancer, file storage, and jump host.

## Deploy from Marketplace

1. Search Oracle Cloud Marketplace for **Oracle MicroTx**, then select <strong><a href="https://marketplace.oracle.com/listings/oracle-microtx-free/ocid1.mktpublisting.oc1.iad.amaaaaaahwdhddqa5wdzog7vbmg2yo2hflgbbxl4ffrnhhgqs32t34nmy2ya" target="_blank" rel="noopener noreferrer">Oracle MicroTx Free</a></strong>.
2. Select **Get App**, then launch the supplied stack in OCI Resource Manager.
3. Provide the stack inputs described below.
4. Review the execution plan and apply the stack.
5. Monitor the **Apply Job**. When it completes, use the stack outputs and deployment instructions to access MicroTx.

## Stack inputs

The Marketplace form groups the main inputs into the following sections. For field-level guidance and the complete provisioning procedure, use the <a href="https://docs.oracle.com/en/database/oracle/transaction-manager-for-microservices/26.1/tmmmg/provision-microtx-oracle-cloud-marketplace.html" target="_blank" rel="noopener noreferrer">official Oracle deployment guide</a>.

- **MicroTx Configurations:** Select the MicroTx version to install and enter a deployment name, which prefixes generated OCI resources. Enter a domain name for the MicroTx HTTPS hostname; the stack generates `<Deployment Name>.<Domain Name>`, such as `microtx-demo.example.com`, and uses a self-signed certificate to secure TLS access to the endpoint.
- **Database Configuration:** Connect MicroTx to your own Oracle Database, or have the stack provision an Oracle Autonomous AI Database in the FREE, DEVELOPER, or PAID edition.
- **Workflow Server Secret:** Upload the `encryption.key` file used to encrypt and store sensitive Workflow Server data. Create the key by following the <a href="https://docs.oracle.com/en/database/oracle/transaction-manager-for-microservices/26.1/tmmmg/prerequisites.html" target="_blank" rel="noopener noreferrer">encryption-key prerequisites</a>.
- **Kubernetes Cluster Configurations:** Configure the worker node-pool name, autoscaling and its minimum and maximum worker-node counts, node instance shape, OCPUs, and memory.

## Access MicroTx

After the **Apply Job** completes, open its output values and complete the following steps:

1. Copy the `hosts_entry` output, for example `129.xx.xx.xx microtx-demo.example.com`, to your local `/etc/hosts` file.
2. Open the `launch_microtx` output URL, for example `https://microtx-demo.example.com/consoleui/`, to access the MicroTx Console UI.
3. The stack uses a self-signed TLS certificate, so your browser might display a security warning. Accept the warning to continue to the Console UI.

## Next steps

Explore the <a href="https://github.com/oracle-samples/microtx-samples/tree/main/workflow" target="_blank" rel="noopener noreferrer">MicroTx Workflow samples</a> for workflow-based orchestration. For distributed transactions, use the <a href="https://github.com/oracle-samples/microtx-samples/tree/main/xa" target="_blank" rel="noopener noreferrer">XA</a>, <a href="https://github.com/oracle-samples/microtx-samples/tree/main/lra" target="_blank" rel="noopener noreferrer">LRA</a>, or <a href="https://github.com/oracle-samples/microtx-samples/tree/main/tcc" target="_blank" rel="noopener noreferrer">TCC</a> samples. Select the pattern that fits the consistency and compensation needs of your services. For the complete Marketplace procedure and every stack option, see the <a href="https://docs.oracle.com/en/database/oracle/transaction-manager-for-microservices/26.1/tmmmg/provision-microtx-oracle-cloud-marketplace.html" target="_blank" rel="noopener noreferrer">official Oracle deployment guide</a>.

### Also explore

The <a href="https://github.com/oracle-samples/microtx-samples/tree/main/docs/quickstart" target="_blank" rel="noopener noreferrer">quick-start documentation</a> covers deployment paths for a local Minikube environment and an OKE cluster.
