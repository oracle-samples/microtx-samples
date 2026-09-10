# Accounts payable exception resolution

![AP payment workflow](./ap_payment_workflow.png)

![AP payment settlement workflow](./ap_payment_settlement_workflow.png)

This sample starts after invoice capture. It accepts a structured invoice, runs AP controls, investigates exceptions with read-only evidence lookups, and atomically commits the AP state, payment instruction, and a TxEventQ settlement event. A MicroTx event handler consumes the committed event and starts external payment settlement.

## What it does

1. **Precheck**: Checks supplier status, PO, receipt, duplicate history, amount variance, and bank verification.
2. **Route**: Rejects hard failures, sends clear invoices to policy, and sends unresolved exceptions to the planner.
3. **Investigate**: Uses the Agentic Planner to choose from read-only evidence APIs such as contract and bank-verification lookups.
4. **Verify**: Re-reads the evidence cited by the planner and produces a structured decision for policy.
5. **Review**: Creates one Human task only when the planner escalates a case.
6. **Decide**: Applies deterministic AP policy using prechecks, verified evidence, and the Human task result.
7. **Prepare payment**: Schedules the invoice, creates a payment instruction, and publishes a TxEventQ event in one short XA transaction.
8. **Settle**: A TxEventQ event handler starts a separate workflow that submits the payment, reconciles an ambiguous provider response, and records the final invoice status with a SQL task.

## Services

Three runnable services are included. `ap-backend` groups the AP checks, evidence reads, policy, and invoice state used by the sample.

| Service | Port | Responsibility | Planner access |
|---|---:|---|---|
| `ap-backend` | 8083 | Mandatory AP prechecks, planner-visible evidence reads, evidence verification, deterministic policy, invoice/AP state | `GET /evidence/*` only |
| `payment-service` | 8084 | Payment instruction | None |
| `bank-mock` | 8085 | External payment-provider simulation with timeout behavior | None |

## Workflow

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
  P -->|Approve| T[7. Short XA transaction<br/>schedule invoice + create instruction + publish event]
  T --> Q[(Oracle TxEventQ)]
  Q --> EH[Event handler<br/>start settlement workflow]
  EH --> E[8. External settlement workflow<br/>idempotent submit + reconciliation]
  E --> S[(SQL task<br/>invoice = PAYMENT_SETTLED)]
```

The sample accepts every structured invoice. Prechecks decide whether it follows
the straight-through path or enters exception investigation. OCR and correction
are upstream of this sample and are not represented as another workflow.

The planner can call only `ap-backend`'s `GET /evidence/*` routes. It cannot
write AP state, create payment instructions, evaluate policy, or call the bank.
Evidence verification and policy remain deterministic service operations.

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
system-of-record data for the headline and timeout cases. The running
`ap-backend` and `payment-service` persist these records in Oracle Database
and enlist their write endpoints as MicroTx XA participants. `bank-mock`
remains non-transactional: it represents the external payment rail, where
idempotency and reconciliation—not XA—are the safe controls.

## Files

```text
accounts-payable-exception-resolution/
├── README.md
├── docker-compose.yml
├── run-local.sh
├── diagrams/                       # source for the rendered workflow diagrams
├── event-handlers/
│   └── ap-payment-settlement-event-handler.json
├── prompts/
│   └── ap-exception-planner.md
├── demo-documents/
│   └── README.md                  # visual-document manifest
├── demo-data/                     # system-of-record fixture model
│   ├── bank-verifications/
│   ├── events/
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

## Workflow definitions

`workflows/ap-exception-resolution-workflow.json` is version **12**. Use this
version for new runs. A repeated `operationId` returns the existing result;
using a new operation ID for an invoice already prepared or settled is
rejected.

The XA transaction timeout is five minutes (`300000` milliseconds), which gives
the AP, payment, and TxEventQ Oracle branches time to enlist.
The workflow requires a MicroTx Workflows build containing commit
`8edaf21abf2b3747fa096194c4f209ee333ca59a` or later, which adds XA context to
the TxEventQ Publish task.

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
12. `Publish_Payment_Settlement_Event` - XA-enlisted TxEventQ publication
13. `Commit_Payment_Transaction` - XA COMMIT

Clear invoices skip the investigation tasks but still pass business policy. The
settlement event, AP invoice state, and payment instruction commit or roll back
together. After COMMIT, the TxEventQ event handler starts the settlement
workflow. There is no direct `START_WORKFLOW` task and no post-commit dispatch
gap in the main workflow.

## Workflow 2: external payment settlement and reconciliation

`workflows/ap-payment-settlement-workflow.json` version **2** runs after payment
preparation commits and its TxEventQ message becomes visible to the subscriber.

It:

1. reads the committed payment instruction by `operationId`;
2. calls `bank-mock` with the same `Idempotency-Key`;
3. allows the payment-settlement POST to time out;
4. always reconciles using `GET /settlements/{operationId}`;
5. uses a SQL task to mark the invoice `PAYMENT_SETTLED` only after the provider reports `SETTLED`.

If a provider POST times out, the workflow reconciles by `operationId` instead
of creating another payment.

### Why external payment settlement uses reconciliation, not LRA

MicroTx supports longer-running compensation patterns such as LRA. They are not
used for bank settlement here: once a bank accepts a payment, a local
compensating action cannot be assumed to reverse it. This workflow uses a stable
`operationId`, idempotent submission, and reconciliation instead. LRA is better
suited to a compensatable action such as releasing a reservation.

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

## Local setup and test

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
load `services/ap-backend/database/demo-data.sql`. Then create the TxEventQ
topic and durable subscriber with
`services/ap-backend/database/txeventq.sql`. Create the payment schema from
`services/payment-service/database/schema.sql`.

The schema, seed, and queue scripts are intentionally a one-time operator
action; `run-local.sh` never creates, seeds, clears, or administers database
objects. That keeps service startup production-like and prevents an
application restart from overwriting system-of-record data. The AP schema
owner requires `AQ_USER_ROLE` and execute privileges on `DBMS_AQ` and
`DBMS_AQADM` before running the queue script. The script selects the TxEventQ
queue-creation API exposed by the connected database: on Oracle Database
19c-compatible deployments this is `CREATE_SHARDED_QUEUE`; on newer
deployments it can be `CREATE_TRANSACTIONAL_EVENT_QUEUE`.

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

In Workflow Builder, select **Enlist in transaction** for
`Schedule_Invoice_For_Payment`, `Create_Payment_Instruction`, and
`Publish_Payment_Settlement_Event`. The checked-in workflow sets
`enlistInTxn: true` on all three tasks. Do not also enable task-level
idempotency on the TxEventQ task: the server rejects that combination because
the publish is already controlled by the global XA transaction.

The `BEGIN` task's `transactionTimeout` is measured in **milliseconds**. Keep it
at `300000` (five minutes); `300` expires before a remote Oracle participant can
enlist and makes the coordinator roll the transaction back.

### Repeat a demo safely

| Rerun type | Result | Cleanup needed? |
|---|---|---|
| Same invoice and same `operationId` after a committed run | Ends as `OPERATION_ALREADY_PROCESSED`; no second XA transaction, instruction, or settlement | No |
| Same invoice with a new `operationId` | Ends as `INVOICE_ALREADY_IN_PAYMENT_PROCESS`, preserving the original payment state | No |
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
production schema. They do not drop or purge TxEventQ; allow the active event
handler to consume committed demo messages before resetting database rows.

### What the local tests prove

The local replay test does **not** claim to be an end-to-end MicroTx/LLM test. `scripted_planner()` makes the same class of read-only calls and emits the same decision contract deterministically so CI remains fast and reproducible.

`tests/test_harness_boundary.py` is different: it reads the real workflow JSON and fails if a planner task:

- uses anything other than GET;
- targets anything other than `ap-backend`;
- points at a write-like path;
- gains access to a non-evidence path or to payment/settlement services;
- places the financial transaction before policy evaluation;
- moves the TxEventQ publication outside the XA boundary or combines XA with
  task-level TxEventQ idempotency;
- restores a direct settlement `START_WORKFLOW` task; or
- disconnects the event handler or final settlement SQL update.

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

### 4. Enable TxEventQ event handling and create the database profile

Enable the TxEventQ event-handler provider in the MicroTx Workflows server and
restart the server. For a Helm installation:

```yaml
workflow:
  server:
    eventHandler:
      txeventq:
        enabled: true
```

The corresponding server property is:

```properties
conductor.event-queues.txeventq.enabled=true
```

Create a relational Oracle Database profile named
`ap-oracle-db-profile`. It must connect as the owner of `ap_invoices` and
`AP_PAYMENT_SETTLEMENT_EVENTS`. The main workflow uses this profile for its
XA-enlisted publish; the settlement workflow uses it for the final SQL update.

### 5. Import the workflows

Import these definitions into MicroTx Workflows:

```text
workflows/ap-payment-preparation-xa-rollback-workflow.json
workflows/ap-payment-settlement-workflow.json
workflows/ap-exception-resolution-workflow.json
```

Import the two referenced workflows first, then import
`ap_exception_resolution` version 12. The imported versions are:

| Workflow | Version |
|---|---:|
| `ap_payment_preparation_xa_rollback` | 2 |
| `ap_payment_settlement` | 2 |
| `ap_exception_resolution` | 12 |

Existing executions and older definitions are not changed; use these versions
for new runs.

**Pre-merge validation:** import and export these definitions once through the
Workflow Builder from the build that contains TxEventQ XA support.
Generated/default properties can vary by release and should be normalized by
that Builder before the sample is merged.

### 6. Create the TxEventQ event handler

Create an active event handler using
`event-handlers/ap-payment-settlement-event-handler.json`, or enter the same
values in **Definitions > Event Handlers**:

| Field | Value |
|---|---|
| Name | `ap_payment_settlement_event_handler` |
| Queue type | `txeventq` |
| Queue name | `AP_PAYMENT_SETTLEMENT_EVENTS` |
| Publisher name | `AP_SETTLEMENT_SUBSCRIBER` |
| Database profile | `ap-oracle-db-profile` |
| Action | Start `ap_payment_settlement`, version 2 |

The action maps `operationId`, `invoiceId`, `instructionId`, and
`simulateSettlementTimeout` from `payload` and uses `operationId` as the
correlation ID. Create and activate this handler before starting the first main
workflow so the durable subscriber exists before a message is published.
There is no subscriber process to add to `run-local.sh`; consumption runs in
the MicroTx Workflows server. `AP_PAYMENT_SETTLEMENT_EVENTS` is dedicated to
the `AP_PAYMENT_PREPARED` event, so the handler deliberately has no condition
or JavaScript evaluator. This avoids loading a JavaScript runtime solely to
filter a topic that carries no other event type.

The settlement path remains safe if a message is redelivered: the bank request
uses `operationId` as its idempotency key and the final SQL update is a
conditional, repeatable update for the same invoice and operation.

### 7. Start the AP exception workflow

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

### 8. Follow external payment settlement after the main workflow commits

After `ap_exception_resolution` commits, the TxEventQ message becomes visible.
The event handler consumes it and starts `ap_payment_settlement` version 2 with
the same `operationId` as its correlation ID. Search workflow executions by
that correlation ID to move from the completed preparation workflow to the
settlement run.

For a timeout demonstration, start `ap_payment_settlement` directly only when you are running the child workflow in isolation:

```json
{
  "operationId": "OP-2026-0003",
  "invoiceId": "INV-1048",
  "instructionId": "<instruction ID created by the main workflow>",
  "simulateSettlementTimeout": false
}
```

For the timeout case use:

```json
{
  "operationId": "OP-2026-0006",
  "invoiceId": "INV-1075",
  "instructionId": "<instruction ID created by the main workflow>",
  "simulateSettlementTimeout": true
}
```

The payment-provider POST may time out after `bank-mock` has persisted the operation. `Reconcile_Payment_Outcome` must still return `SETTLED` for the same `operationId`.

## XA boundary and proof

The main workflow's five-minute short XA boundary contains three atomic effects:
the AP invoice scheduling update at port 8083, payment-instruction creation at
port 8084, and publication to `AP_PAYMENT_SETTLEMENT_EVENTS`. The two HTTP
services are Java Spring Boot XA participants; the TxEventQ task directly
enlists its Oracle Database branch. Bank submission starts only after COMMIT
and remains outside XA.

To prove atomicity, configure the payment HTTP task with
`?simulateFailure=true`. It returns 500 after the AP branch writes; TCS must
roll back all enlisted branches. The invoice must remain `RECEIVED` and
`GET /payment-instructions/{operationId}` must return 404. The settlement event
must not be visible to the subscriber. A successful run should show the two
HTTP database branches and the TxEventQ database branch in TCS transaction
details.

## Test cases

The cases are deliberately small and each has one reason to exist.

### Recommended two-case demo

Use `03-bank-change.json` for both demonstrations. It is the only headline
case that visibly exercises every stage: prechecks, planner evidence tools,
structured decision contract, evidence verification, the one Human task,
business policy, short XA preparation, and external payment settlement.

| Demo | Input | Human-task action | Expected result |
|---|---|---|---|
| Positive | `03-bank-change.json` | Mark `AP_Human_Review` as `COMPLETED` | Policy approves; XA commits the event and the event-started settlement workflow reconciles `SETTLED`. |
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
