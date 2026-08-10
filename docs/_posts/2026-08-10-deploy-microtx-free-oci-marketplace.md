---
title: Deploy Oracle MicroTx Free on OCI with Oracle Cloud Marketplace
description: Deploy MicroTx Free on Oracle Kubernetes Engine using the Oracle Cloud Marketplace Terraform stack.
date: 2026-08-10
updated: 2026-08-10
author: Oracle MicroTx team
tags:
  - MicroTx
  - OCI
  - OKE
  - Oracle Cloud Marketplace
  - Terraform
---

Oracle Cloud Marketplace provides a guided route to deploy Oracle MicroTx Free into an Oracle Cloud Infrastructure environment. The Marketplace stack uses Terraform to provision the required resources and deploy MicroTx to Oracle Kubernetes Engine (OKE).

## Before you begin

Prepare an OCI account with permission to create or use an OKE cluster and the related network resources. Review the stack inputs carefully before applying it, especially the compartment, region, cluster, and networking choices.

## Deploy from Marketplace

1. Open the Oracle Cloud Marketplace listing for Oracle MicroTx Free.
2. Select **Get App**, then create a stack in OCI Resource Manager.
3. Supply the required Terraform variables for your OCI environment.
4. Review the execution plan and apply the stack.
5. When the job completes, use the stack outputs and the deployment instructions from the listing to access MicroTx.

## Continue with a sample

After deployment, choose a transaction model or workflow sample from this repository. The <a href="https://github.com/oracle-samples/microtx-samples/tree/main/docs/quickstart" target="_blank" rel="noopener noreferrer">quick-start documentation</a> covers a local Minikube path and an OKE path.

## Next steps

Use MicroTx to coordinate distributed transactions with XA, LRA, or TCC, or explore MicroTx Workflow samples for workflow-based orchestration. Select the pattern that fits the consistency and compensation needs of your services.
