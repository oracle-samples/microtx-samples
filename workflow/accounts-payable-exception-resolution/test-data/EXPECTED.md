# Expected results

The exact contract fields each case must produce. `tests/test_replay_cases.py`
asserts on these fields — never on wording, because a prompt tweak that changes
phrasing is fine and a prompt tweak that stops escalating bank changes is not.

## Summary

| Case | Planner `status` | Evidence verification | Human | Policy `status` | Terminal `outcome` | XA opened |
|---|---|---|---|---|---|---|
| `01-clean` | not run | not needed | not reached | `APPROVE` | `PAYMENT_SETTLED` | yes |
| `02-freight-variance` | `APPROVE` | `true` | not reached | `APPROVE` | `PAYMENT_SETTLED` | yes |
| `03-bank-change` | `ESCALATE` | `true` | `approved: true` | `APPROVE` | `PAYMENT_SETTLED` | yes |
| `04-duplicate` | not run | not needed | not reached | not evaluated | `INVOICE_REJECTED_BY_PRECHECK` | **no** |
| `05-partial-receipt` | `ESCALATE` | `true` | `approved: true` | `REJECT` | `INVOICE_REJECTED_BY_POLICY` | **no** |
| `06-payment-timeout` | not run | not needed | not reached | `APPROVE` | `PAYMENT_SETTLED` | yes |

---

## 01-clean — `INV-1001`, $12,500 against `PO-7800`

Nothing is wrong with this invoice, so deterministic prechecks bypass investigation and send it to business policy.

- Mandatory prechecks read the PO and receipt, confirm an exact match, and
  check duplicates. The planner is not invoked.
- The planner is not invoked; policy returns `APPROVE` from authoritative precheck facts.
- `ap-backend` invoice status ends `PAYMENT_SCHEDULED`.
- Exactly one payment instruction and one settlement for `OP-2026-0001`.

## 02-freight-variance — `INV-1047`, $48,700 against `PO-7811`

The $800 story with the bank question already settled. This is the case that
shows dynamic investigation paying off: the planner does not know in advance
that it will need the contract.

- Mandatory prechecks establish the amount variance and complete receipt;
  investigation then reads the contract.
- `evidence[]` contains `contract: FREIGHT_WITHIN_ALLOWANCE`.
- Planner `status` is `APPROVE`, `unresolvedRisks` empty.
- Duplicate detection is mandatory precheck logic. Bank state remains an
  authoritative policy fact even when no bank evidence tool was needed.
- Terminal outcome `PAYMENT_SETTLED`.

## 03-bank-change — `INV-1048`, $48,700 against `PO-7812`

The headline case. Same freight explanation, one unresolved risk.

- Prechecks contain the amount variance and complete receipt; `evidence[]`
  contains `contract: FREIGHT_WITHIN_ALLOWANCE` and `bank_verification: PENDING`.
- `unresolvedRisks` contains `supplier_bank_change_unverified`.
- Planner `status` is `ESCALATE`. It is not `REJECT`: rejecting is a policy
  outcome, and the planner is not asked to apply the rule.
- `AP_Human_Review` runs. The replay test supplies
  `{"approved": true, "reviewer": "ap.reviewer@example.com",
  "note": "Confirmed new account by callback to known contact"}`.
- Policy evaluates **with** that approval and returns `APPROVE`. The duplicate
  and supplier-block rules remain mandatory precheck controls.
- Terminal outcome `PAYMENT_SETTLED`.

If the human declines instead, policy returns `REJECT` with reason
`human_review_declined` and no transaction opens.

## 04-duplicate — `INV-1052` / number `INV 1049`, $9,450

- Deterministic precheck returns `duplicateFound: true`, matching the
  already-paid `INV-1049` (`PAY-55021`) on both normalised number and amount.
- Planner is not invoked.
- The precheck route rejects using the authoritative duplicate fact.
  `Record_Precheck_Rejection` writes the reason to `ap-backend`; invoice status
  ends `REJECTED` with a non-empty reason.
- Terminal outcome `INVOICE_REJECTED_BY_PRECHECK`.
- **No XA transaction is opened and no payment instruction exists for
  `OP-2026-0004`.** The replay test asserts this directly.

## 05-partial-receipt — `INV-1061`, $22,000 against `PO-7820`

The case where a well-behaved planner must not be clever.

- Deterministic prechecks establish that the receipt is `PARTIAL` (60 of 100
  received). The planner must not treat the shortfall as immaterial or net the
  invoice down.
- `supplier` is `BLOCKED` on quality dispute QD-4417.
- `unresolvedRisks` contains `goods_receipt_incomplete` and `supplier_blocked`.
- Planner `status` is `ESCALATE`.
- The replay test supplies a human approval, `{"approved": true, ...}`.
- Policy returns **`REJECT`** anyway, with reason starting `supplier_blocked`.
  This is the case that proves the human decision is an input to policy rather
  than a way around it: rule 2 fires before the human decision is ever read.
- Terminal outcome `INVOICE_REJECTED_BY_POLICY`, no XA transaction.

Policy rejects the authoritative incomplete-receipt fact even after a
human approval. If the planner also cites an incorrect supplier or contract
fact, `/verify-evidence` rejects that citation before policy uses its result.

## 06-payment-timeout — `INV-1075`, $8,300 against `PO-7830`

Identical to `01-clean` up to the commit. The difference is after it.

- `Settle_Payment` is called with `?simulateTimeout=true`. `bank-mock` records
  the settlement, then sleeps past the client read timeout.
- The settlement call fails from the caller's point of view. That is expected
  and is not an error state.
- `Reconcile_Payment_Outcome` reads `GET /settlements/OP-2026-0006` and finds
  `status: SETTLED`.
- Terminal outcome `PAYMENT_SETTLED`.
- `bank-mock` holds **exactly one** settlement for `OP-2026-0006`, and
  `payment-service` holds exactly one instruction. The replay test asserts the
  counts, because the failure this case guards against is paying twice.
