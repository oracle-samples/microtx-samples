# Accounts Payable Exception Resolution with MicroTx Workflows

**Known AP controls stay deterministic. The Agentic Planner investigates only the exceptions those controls cannot explain; verified facts, policy, human review, and transactions decide whether financial state changes.**

This sample starts after invoice capture. The input is already a structured invoice. The problem is what happens when that invoice does not match cleanly and the system has to investigate before it can continue.

## Why this sample

A supplier invoice arrives for **$48,700** against a **$47,900** purchase order. The $800 difference is freight. The goods were received. The supplier also changed its bank account recently and that change has not completed independent verification.

There are two different jobs here:

1. **Run mandatory AP controls.** Check duplicates, PO, receipt, and baseline matching every time.
2. **Investigate an unresolved exception.** When a variance or receipt issue remains, read contract, supplier, or bank-verification evidence as needed.
3. **Control the financial action.** Verify planner-cited facts, apply deterministic policy, involve a person when required, and only then change AP/payment state.

The sample keeps those jobs separate on purpose.

## What it demonstrates

- **Deterministic AP prechecks** - duplicate detection, PO/receipt lookup, and basic matching happen before any planner call.
- **Agentic Planner / Agent Loop** - only an unresolved exception reaches the planner, which chooses the next read-only evidence task.
- **Agent Harness** - the planner can reach only `ap-backend`'s `GET /evidence/*` routes. No policy, AP write, payment, or payment-settlement operation is registered as a planner tool.
- **Evidence verification** - the workflow does not trust a planner-cited fact. `POST /verify-evidence` re-reads it from source data.
- **Deterministic policy** - policy evaluates authoritative precheck facts, verified investigation evidence, and any recorded human decision.
- **Human review** - an escalated concern can pause the workflow; the review result is an input to policy, not a bypass around it.
- **Durable execution and idempotency** - MicroTx Workflows owns the long-running execution state and can avoid redoing completed planner/task work after recovery.
- **Short XA boundary** - only the AP-state update and payment-instruction creation are inside the transaction.
- **External payment settlement and reconciliation** - a linked durable workflow submits the approved instruction to the payment rail and reconciles by stable `operationId`; a timeout is not treated as proof of failure.

## Architecture

Three runnable services are included. `ap-backend` packages several logical AP responsibilities to keep the local sample easy to run; its route-level planner boundary remains explicit.

| Service | Port | Responsibility | Planner access |
|---|---:|---|---|
| `ap-backend` | 8083 | Mandatory AP prechecks, planner-visible evidence reads, evidence verification, deterministic policy, invoice/AP state | `GET /evidence/*` only |
| `payment-service` | 8084 | Payment instruction | None |
| `bank-mock` | 8085 | External payment-provider simulation with timeout behavior | None |

The repository split is intentional. This is the architecture narrative used by
the blog and reflected in the workflow:

```mermaid
flowchart TD
  A[1. Structured invoice<br/>from OCR / ERP upstream] --> B[2. Deterministic AP prechecks<br/>duplicate, PO, receipt, baseline, bank controls]
  B -->|Reject| X[End: record rejection]
  B -->|Clear| P[6. Apply business policy<br/>deterministic authority]
  B -->|Exception| H[3. Agent harness<br/>Agentic Planner, read-only evidence tools]
  H --> C[4. Structured decision contract<br/>decision, evidence, unresolved risks]
  C --> V[5. Verify planner evidence<br/>independent source re-read]
  V --> R{Planner escalation?}
  R -->|Yes| U[Human review]
  R -->|No| P
  U --> P
  P -->|Reject / hold| X
  P -->|Approve| T[7. Short XA transaction<br/>schedule invoice + create instruction]
  T --> E[8. External settlement workflow<br/>idempotent submit + reconciliation]
```

The sample accepts every structured invoice, not only one pre-labelled as an
exception. Mandatory prechecks determine whether it takes the straight-through
path or enters the exception-investigation branch. OCR and correction are shown
only as the upstream source of the structured invoice; they are intentionally
not another workflow in this sample.

The compact runtime does not merge authority. Within `ap-backend`, evidence reads answer **what is true**, evidence verification checks planner-cited facts, and policy answers **what is allowed**. The planner registry exposes only the read-only evidence routes; the static boundary test rejects every other route.

## Demo evidence: documents and system records

The workflow begins with a structured invoice; it does not perform OCR or
extract information from a PDF. For a visual demo, distinguish business
documents from the records that operational systems persist:

| Business document | Persistent system record or derived result |
|---|---|
| Supplier invoice | Supplier master and bank-change audit record |
| Purchase order | Bank-verification control record |
| Goods receipt | Invoice history and duplicate-query result |
| Contract excerpt | Payment instruction |
| Supplier bank-change notice | Settlement and reconciliation record |

The source documents explain why a fact exists. The operational records hold
the current state that controls payment. In particular, a duplicate check is a
deterministic query over invoice history, not a PDF stored beside the invoice.

[`demo-documents/README.md`](demo-documents/README.md) defines the visual
document pack; [`demo-data/`](demo-data) contains structured examples of the
system-of-record data for the headline and timeout cases. The running mock
`ap-backend` and `payment-service` persist these records in Oracle Database
and enlist their write endpoints as MicroTx XA participants. `bank-mock`
remains non-transactional: it represents the external payment rail, where
idempotency and reconciliation—not XA—are the safe controls.

## Repository layout

```text
accounts-payable-exception-resolution/
├── README.md
├── docker-compose.yml
├── run-local.sh
├── prompts/
│   └── ap-exception-planner.md
├── demo-documents/
│   └── README.md                  # visual-document manifest
├── demo-data/                     # system-of-record fixture model
│   ├── bank-verifications/
│   ├── invoice-history.json
│   ├── payment-instructions/
│   ├── settlements/
│   ├── supplier-bank-changes/
│   └── supplier-master/
├── services/
│   ├── ap-backend/
│   ├── payment-service/
│   └── bank-mock/
├── test-data/
│   ├── 01-clean.json
│   ├── 02-freight-variance.json
│   ├── 03-bank-change.json
│   ├── 04-duplicate.json
│   ├── 05-partial-receipt.json
│   ├── 06-payment-timeout.json
│   └── EXPECTED.md
├── tests/
│   ├── test_harness_boundary.py
│   └── test_replay_cases.py
└── workflows/
    ├── ap-exception-resolution-workflow.json
    ├── ap-payment-preparation-xa-rollback-workflow.json
    └── ap-payment-settlement-workflow.json
```

## Workflow 1: exception resolution and payment preparation

`workflows/ap-exception-resolution-workflow.json` contains the business workflow:

The current definition is version **11**. Import it as version 11 and start that
version when testing Agentic Planner scenarios. The definition makes repeat runs
safe: the same operation terminates as already processed, while a different
operation ID for an already scheduled invoice is rejected. It uses real XA
participants and gives the short XA boundary five minutes (`300000` milliseconds),
which leaves enough time for both remote Oracle participant branches to enlist.
Version 4 added
`Create_Structured_Decision_Contract`, which extracts the final decision from
the planner's durable `plannerHistory` envelope before verification, and uses
the planner escalation path as the workflow's only Human task.

1. `Run_Deterministic_AP_Prechecks` - duplicate, PO, receipt, and baseline-match checks
2. `Route_AP_Precheck` - `REJECT` ends; `CLEAR` bypasses investigation; only `EXCEPTION` enters the agent harness
3. `Investigate_AP_Exception` - `AGENTIC_PLANNER`, only for an unresolved exception
4. `Create_Structured_Decision_Contract` - extracts the final decision from the Agentic Planner's durable `plannerHistory` output
5. `Verify_Investigation_Evidence` - independently re-reads planner-cited facts
6. `AP_Human_Review` - only when the investigation escalates
7. `Apply_Business_Policy` - the single deterministic business-authority step for every non-rejected invoice
8. `Check_Business_Policy` - rejects, holds for review, or continues to payment preparation
9. `Begin_Payment_Transaction` - XA BEGIN
10. `Schedule_Invoice_For_Payment` - AP write
11. `Create_Payment_Instruction` - payment write
12. `Commit_Payment_Transaction` - XA COMMIT
13. `Start_Payment_Settlement` - asynchronously starts the linked payment-settlement workflow

This mirrors the blog’s eight-stage story: structured invoice, prechecks, agent harness, structured decision contract, evidence checks, business policy, short XA, and external settlement. A clear invoice skips the exception-only agent harness but still passes the single visible business-policy step. The payment-settlement workflow starts only after COMMIT. `Start_Payment_Settlement` is optional, so a dispatch failure cannot invoke the XA rollback handler after a successful commit. In production, recover the dispatch from a settlement-request outbox/event written with the payment-preparation state.

## Workflow 2: external payment settlement and reconciliation

`workflows/ap-payment-settlement-workflow.json` is linked from the main workflow after payment preparation commits. It has its own durable execution, retry, and reconciliation lifecycle.

It:

1. reads the committed payment instruction by `operationId`;
2. calls `bank-mock` with the same `Idempotency-Key`;
3. allows the payment-settlement POST to time out;
4. always reconciles using `GET /settlements/{operationId}`.

This is the sample's implementation of the rule: **a timeout is ambiguous; reconcile by business identity instead of creating another payment.**

### Why external payment settlement uses reconciliation, not LRA

MicroTx Distributed Transactions also supports longer-running compensation
patterns such as LRA. This sample deliberately does not use one for bank
payment settlement: once an external bank has accepted a payment, the system cannot
assume that a local compensating action will reverse it. The safer pattern here
is a stable `operationId`, idempotent submission, and reconciliation. LRA is a
better fit for a broader, genuinely compensatable business process—for example,
releasing a reservation when a still-pending payment request is cancelled.

## Planner contract

The prompt in `prompts/ap-exception-planner.md` follows the MicroTx Agentic Planner protocol: planner responses contain `status` and `next_tools_to_call`. On the final `SUCCESS` response the sample also asks for a business `decision`:

```json
{
  "status": "SUCCESS",
  "next_tools_to_call": [],
  "decision": "ESCALATE",
  "evidence": [
    {"type":"contract","reference":"C-2291 s7.2","finding":"FREIGHT_WITHIN_ALLOWANCE"},
    {"type":"bank_verification","reference":"SUP-NORTHSTAR","finding":"PENDING"}
  ],
  "unresolvedRisks": ["supplier_bank_change_unverified"],
  "reason": "The $800 variance is within the contract freight allowance. The new bank account is still awaiting independent verification."
}
```

The business decision is one of `APPROVE`, `ESCALATE`, or `REJECT`. It is **not** payment authority.

## Run the local service/test mode

Run the static Agent Harness boundary check before importing any workflow. It
needs no database, model, or running services:

```bash
python3 tests/test_harness_boundary.py
```

The HTTP replay tests are optional API-contract checks after the services have
been started with `./run-local.sh`; they do not substitute for a real TCS XA
test. The recommended end-to-end validation is the two-case workflow demo
below, followed by TCS branch inspection and the injected rollback case.

### Run the services as local processes, without Docker

If the MicroTx Workflows server is running directly on your machine, start the
two Spring Boot XA participants and the Python bank mock with one command.
First create the AP schema from `services/ap-backend/database/schema.sql` and
load `services/ap-backend/database/demo-data.sql`. Create the payment schema
from `services/payment-service/database/schema.sql`.

The schema and demo seed scripts are intentionally a one-time operator action;
`run-local.sh` never creates, seeds, or clears database tables. That keeps the
service startup production-like and prevents an application restart from
overwriting system-of-record data.

The schemas may be on one Oracle Database instance, but use separate schemas
or databases and distinct XA resource-manager IDs. Export the settings below
(`.env.example` is a copyable template):

```bash
export AP_DATABASE_URL='jdbc:oracle:thin:@//db-host:1521/service_name'
export AP_DATABASE_USERNAME='AP_BACKEND'
export AP_DATABASE_PASSWORD='...'
export PAYMENT_DATABASE_URL='jdbc:oracle:thin:@//db-host:1521/service_name'
export PAYMENT_DATABASE_USERNAME='PAYMENT_SERVICE'
export PAYMENT_DATABASE_PASSWORD='...'
export MICROTX_COORDINATOR_URL='http://127.0.0.1:9000/api/v1'
export AP_MICROTX_XA_RESOURCE_MANAGER_ID='5BFC0C43-5207-4B1F-8D16-A0B7A6B5A803'
export PAYMENT_MICROTX_XA_RESOURCE_MANAGER_ID='65A79F32-E6A6-4AFE-89B6-45F0E70C7418'
export AP_DATABASE_CONNECT_TIMEOUT_SECONDS=10
export PAYMENT_DATABASE_CONNECT_TIMEOUT_SECONDS=10
```

These are normal Spring properties too, for example
`--ap.datasource.url=...`; environment variables avoid putting credentials in
shell history. The MicroTx Java distribution must have installed
`com.oracle.microtx:microtx-spring-boot-starter:1.0-SNAPSHOT` in Maven, as it
does for the existing XA Java samples.

Both Java services validate `SELECT 1 FROM DUAL` during startup. A bad database
URL, wallet, password, service name, firewall rule, or schema now stops the
runner with the Oracle error instead of later timing out on `/prechecks`.

```bash
./run-local.sh
```

On its first run, the script creates `.venv` for `bank-mock` and builds the
two Spring Boot jars. It then starts the three services on `127.0.0.1:8083`
through `127.0.0.1:8085`. Later runs leave already-running services alone.
Logs are in `.local-run/`.

For a local Workflow server, import workflow definitions whose HTTP task URIs
use these local addresses instead of Docker service names:

```text
http://ap-backend:8083       -> http://127.0.0.1:8083
http://payment-service:8084 -> http://127.0.0.1:8084
http://bank-mock:8085       -> http://127.0.0.1:8085
http://otmm-tcs:9000        -> the URL of your locally running TCS
```

Use the Workflow Builder to make those endpoint substitutions while importing,
or maintain local copies of the definitions outside the repository. Stop the
services when finished:

```bash
./run-local.sh stop
```

`ap-backend` and `payment-service` are MicroTx Spring XA participants. Their
write endpoints receive the transaction context from Workflows and use the
MicroTx-managed `microTxSqlConnection`, which enlists the two Oracle branches.
`bank-mock` deliberately does not enlist.

In Workflow Builder, select **Enlist in transaction** for both
`Schedule_Invoice_For_Payment` and `Create_Payment_Instruction`. The checked-in
workflow sets `enlistInTxn: true`; without it, an HTTP write is outside XA even
when it appears between `BEGIN` and `COMMIT` tasks.

The `BEGIN` task's `transactionTimeout` is measured in **milliseconds**. Keep it
at `300000` (five minutes); `300` expires before a remote Oracle participant can
enlist and makes the coordinator roll the transaction back.

### Repeat a demo safely

| Rerun type | Result | Cleanup needed? |
|---|---|---|
| Same invoice and same `operationId` after a committed run | Ends as `OPERATION_ALREADY_PROCESSED`; no second XA transaction, instruction, or settlement | No |
| Same invoice with a new `operationId` | Ends as `INVOICE_ALREADY_SCHEDULED`, preserving the original payment state | No |
| Run every scenario again from its initial state | Reset mutable AP/payment demo state, then restart `bank-mock` | Yes |

For a clean repeatable demo, run the following as their respective schema
owners, then restart the local services to clear `bank-mock`'s in-memory
settlements:

```text
services/ap-backend/database/reset-demo-state.sql
services/payment-service/database/reset-demo-state.sql
./run-local.sh stop
./run-local.sh
```

The reset scripts retain reference evidence and the intentionally seeded paid
invoice history used by the duplicate test. They delete only AP operation state
and payment instructions created by workflow executions. Never use them in a
production schema.

### What the local tests prove

The local replay test does **not** claim to be an end-to-end MicroTx/LLM test. `scripted_planner()` makes the same class of read-only calls and emits the same decision contract deterministically so CI remains fast and reproducible.

`tests/test_harness_boundary.py` is different: it reads the real workflow JSON and fails if a planner task:

- uses anything other than GET;
- targets anything other than `ap-backend`;
- points at a write-like path;
- gains access to a non-evidence path or to payment/settlement services;
- or if the financial transaction is placed before policy evaluation.

Keep this test in CI. It verifies the sample's central authority claim as configuration, not as a prompt instruction.

## Run with MicroTx Workflows

The exact deployment commands depend on how your MicroTx Workflows environment is installed. The steps below are the sample-level configuration required after MicroTx Workflows is available.

### 1. Make the sample services reachable from Workflows

Run the included Docker stack for local development, or deploy the three services to the network/namespace from which the MicroTx Workflows runtime can resolve:

```text
ap-backend:8083
payment-service:8084
bank-mock:8085
```

The workflow definitions use those service names. Change the URIs if your environment uses different DNS names.

### 2. Configure an LLM profile

In MicroTx Workflows, create an LLM profile named:

```text
ap-planner-llm
```

Choose the provider/model available in your environment. The workflow JSON deliberately uses `<configure-in-MicroTx>` as the model placeholder so the public sample does not assume one provider.

### 3. Create the Agentic Planner prompt template

Create a prompt template named:

```text
ap_exception_planner
```

Use the contents of:

```text
prompts/ap-exception-planner.md
```

The planner task references this template by name.

### 4. Import the workflows

Import these definitions into MicroTx Workflows:

```text
workflows/ap-payment-preparation-xa-rollback-workflow.json
workflows/ap-payment-settlement-workflow.json
workflows/ap-exception-resolution-workflow.json
```

Import the two referenced workflows first, then import
`ap_exception_resolution` version 11. Existing executions and the old workflow
names are not changed by this import; use version 11 for all new runs.

**Pre-merge validation:** import and export these definitions once through the Workflow Builder used for the target MicroTx release. This repository version is aligned to the current documented 26.1 task shape, but generated/default properties can vary by release and should be normalized by the Builder before the sample is merged.

### 5. Start the AP exception workflow

Use a test payload such as `test-data/03-bank-change.json`. Only `operationId` and `invoice` are workflow inputs; `_description` in the test-data file is documentation and should be removed before submitting the input.

Example workflow input:

```json
{
  "operationId": "OP-2026-0003",
  "invoice": {
    "invoiceId": "INV-1048",
    "invoiceNumber": "INV-1048",
    "supplierId": "SUP-NORTHSTAR",
    "poId": "PO-7812",
    "amount": 48700.0,
    "currency": "USD",
    "invoiceDate": "2026-08-21",
    "simulateSettlementTimeout": false
  }
}
```

For the bank-change case, the planner should gather enough evidence to return `ESCALATE`. Complete the `AP_Human_Review` Human task in the Workflows UI with output similar to:

```json
{
  "approved": true,
  "reviewer": "ap.reviewer@example.com",
  "note": "Confirmed new account by callback to known supplier contact"
}
```

The human result is then passed to the deterministic policy endpoint in `ap-backend`. The policy rules still execute; the review does not bypass them.

### 6. Follow external payment settlement after the main workflow commits

After `ap_exception_resolution` commits, `Start_Payment_Settlement` starts `ap_payment_settlement` asynchronously with the same `operationId` as its correlation ID. Use the workflow execution view to navigate from the start task to the payment-settlement run.

For a timeout demonstration, start `ap_payment_settlement` directly only when you are running the child workflow in isolation:

```json
{
  "operationId": "OP-2026-0003",
  "simulateSettlementTimeout": false
}
```

For the timeout case use:

```json
{
  "operationId": "OP-2026-0006",
  "simulateSettlementTimeout": true
}
```

The payment-provider POST may time out after `bank-mock` has persisted the operation. `Reconcile_Payment_Outcome` must still return `SETTLED` for the same `operationId`.

## XA boundary and proof

The main workflow's five-minute short XA boundary contains exactly two writes:
the AP invoice scheduling update at port 8083 and payment-instruction creation
at port 8084. Both are Java Spring Boot MicroTx participants with Oracle XA
data sources and separate resource-manager IDs. Bank submission starts only
after COMMIT and is outside XA.

To prove atomicity, configure the payment HTTP task with
`?simulateFailure=true`. It returns 500 after the AP branch writes; TCS must
roll back both branches. The invoice must remain `RECEIVED` and
`GET /payment-instructions/{operationId}` must return 404. A successful run
should list two branches in TCS transaction details.

## Test cases

The cases are deliberately small and each has one reason to exist.

### Recommended two-case demo

Use `03-bank-change.json` for both demonstrations. It is the only headline
case that visibly exercises every stage: prechecks, planner evidence tools,
structured decision contract, evidence verification, the one Human task,
business policy, short XA preparation, and external payment settlement.

| Demo | Input | Human-task action | Expected result |
|---|---|---|---|
| Positive | `03-bank-change.json` | Mark `AP_Human_Review` as `COMPLETED` | Policy approves; the workflow reaches XA and the child payment-settlement workflow reconciles `SETTLED`. |
| Negative | Same `03-bank-change.json` with a new `operationId` | Mark `AP_Human_Review` as Rejected or Failed | Policy records the rejection; no XA transaction, payment instruction, or settlement is created. |

In the current Human-task UI, task status is authoritative: `COMPLETED`
approves; Rejected or Failed rejects. The task is marked optional solely so a
rejected review reaches business policy, records its rejection, and ends in the
normal policy-rejected terminal branch. A future review form can additionally
supply an explicit `approved` field.

The remaining fixtures are retained for QA and customer exploration.

| Case | Planner | Policy | Expected outcome |
|---|---|---|---|
| `01-clean` | not run | APPROVE | payment prepared / external settlement succeeds |
| `02-freight-variance` | APPROVE | APPROVE | contract explains variance |
| `03-bank-change` | ESCALATE | APPROVE after human review | payment prepared |
| `04-duplicate` | not run | REJECT | no payment |
| `05-partial-receipt` | ESCALATE | REJECT | hard policy control wins even after review |
| `06-payment-timeout` | not run | APPROVE | reconciliation finds one settled operation |

Exact deterministic expectations are in `test-data/EXPECTED.md`.

## What is deliberately not in v1

- OCR / invoice extraction
- RAG / vector database
- Kafka or another broker
- multi-agent collaboration
- MCP as a requirement
- a full ERP or UI

Those are valid concerns, but they do not help demonstrate the sample's core boundary. An optional follow-on can expose the same three planner evidence capabilities through an authenticated MCP server without changing the business flow.

## Before submitting a PR

1. Run `python3 tests/test_harness_boundary.py`.
2. Run `python3 tests/test_harness_boundary.py` and the two-case workflow demo against the configured local services.
3. Import/re-export the workflow JSON through the target MicroTx Workflow Builder.
4. Run at least the bank-change case against a real configured LLM profile.
5. Verify TCS lists two XA branches for a successful bank-change run, then verify an injected payment-service failure rolls back both database writes.
6. Verify the payment-settlement timeout case; it must reconcile by the same `operationId` and must never trigger XA rollback.
