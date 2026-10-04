# Demo system-of-record data

This directory models the persistent records behind the AP exception demo. The
JSON files are intentionally structured data, not PDFs: they represent the
kind of rows held by supplier-master, AP, payment, and settlement systems.

The runnable FastAPI services still use small in-memory fixtures so the sample
can start with one command. These files are the corresponding durable-record
model for demos and for a future database-backed implementation. They are not
an additional workflow input and are not read by the Agentic Planner directly.

| Record | Typical system of record | Why it is structured data |
|---|---|---|
| Supplier master | supplier/ERP master data | Current supplier status and payment profile |
| Bank change | supplier-master audit history | An auditable change event, not payment authority |
| Bank verification | verification-control system | Current independently verified state |
| Invoice history | AP ledger | Source for deterministic duplicate queries |
| Payment instruction | payment service | Idempotent internal financial instruction |
| Settlement | payment rail / reconciliation ledger | Result reconciled by stable operation identity |

`invoice-history.json` is the source data for a duplicate query. A “duplicate
check clear” is not stored as a separate durable record; it is the result of
querying invoice history at the time of the precheck.

All values are fictitious demo data.
