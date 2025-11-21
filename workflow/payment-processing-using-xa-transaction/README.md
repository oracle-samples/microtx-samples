# Financial workflows — Payment processing using XA transactions

![XA transaction workflow](./xa-wf.png)
_Figure 1: XA transaction workflow_

![Rollback failure workflow](./xa-failure-wf.png)
_Figure 2: Rollback failure workflow_

## Business problem
Payment flows often span multiple independent systems. For example, debit a user's internal account balance and charge an external payment gateway. These operations must be atomic: either both succeed, or both fail. Otherwise, you risk inconsistent states (e.g., user is debited but payment is not processed).

## What's in this folder
- [xa-transaction-wf.json](./xa-transaction-wf.json) — Main XA workflow definition (`transaction_xa`)
- [xa-failure-wf.json](./xa-failure-wf.json) — Failure/rollback workflow (`rollback_txn`)

## Prerequisites
- XA Transaction Coordinator reachable at `http://otmm-tcs:9000/api/v1`
- Participating department services running at `http://dept1:8081` and `http://dept2:8082`. See [../../xa/java/README.md](../../xa/java/README.md) for deployment steps.
- The two workflow definitions (mentioned above) registered in your workflow engine

## How it works (high level)
1. Check balances in parallel
   - Two HTTP GET calls to fetch account balances for `from` and `to` accounts of `dept1` and `dept2` departments/services respectively
   - Fetch balance endpoints are expected at:
     ```
     GET http://dept1:8081/accounts/${workflow.input.from}
     GET http://dept2:8082/accounts/${workflow.input.to}
     ```
   where `${workflow.input.from}` and `${workflow.input.to}` are workflow input parameters that specify the account names for the withdrawal (from dept1) and deposit (to dept2), respectively.
2. Begin XA transaction
   - TRANSACTION task calls the coordinator with:
     - `coordinatorUrl: http://otmm-tcs:9000/api/v1`
     - `transactionType: XA`
     - `action: BEGIN`
3. Perform operations within the XA transaction
   - Withdraw from `from` account:
     ```
     POST http://dept1:8081/accounts/${workflow.input.from}/withdraw?amount=${workflow.input.amount}
     ```
   - Deposit to `to` account:
     ```
     POST http://dept2:8082/accounts/${workflow.input.to}/deposit?amount=${workflow.input.amount}
     ```
4. Commit XA transaction
   - TRANSACTION task with `action: COMMIT`

If any step fails, the workflow's `failureWorkflow` is invoked:
- `xa-failure-wf.json` (`rollback_txn`): a single TRANSACTION task with `action: ROLLBACK` to revert the XA transaction.

## Inputs
The main workflow `transaction_xa` expects:
- `from` — source account identifier
- `to` — destination account identifier
- `amount` — transfer amount (numeric)

Example workflow input:
```json
{
  "from": "account1",
  "to": "account2",
  "amount": 5
}
```

## Expected behavior
- On success: both debit and credit occur, then the transaction is committed.
- On failure: the failure workflow rolls back the transaction to maintain consistency.

## Files reference
- [xa-transaction-wf.json](./xa-transaction-wf.json): Defines the primary flow including:
  - Parallel balance checks (FORK/JOIN)
  - XA `BEGIN` / `COMMIT` TRANSACTION tasks
  - HTTP `withdraw` and `deposit` calls
  - `failureWorkflow: "rollback_txn"`
- [xa-failure-wf.json](./xa-failure-wf.json): Defines `rollback_txn`, which issues a `ROLLBACK` TRANSACTION action
