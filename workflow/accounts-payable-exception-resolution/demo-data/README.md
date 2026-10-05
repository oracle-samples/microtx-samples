# Demo system-of-record data

This directory models the persistent records behind the AP exception demo. The
JSON files are intentionally structured data, not PDFs: they represent the
kind of rows held by supplier-master, AP, payment, and settlement systems.

The AP and payment services persist their runtime state in Oracle Database;
`bank-mock` alone keeps its simulated external settlements in memory. These
JSON files are readable examples of the corresponding system records and
events. They are not additional workflow input and are not read by the Agentic
Planner directly.

| Record | Typical system of record | Why it is structured data |
|---|---|---|
| Supplier master | supplier/ERP master data | Current supplier status and payment profile |
| Bank change | supplier-master audit history | An auditable change event, not payment authority |
| Bank verification | verification-control system | Current independently verified state |
| Invoice history | AP ledger | Source for deterministic duplicate queries |
| Payment instruction | payment service | Idempotent internal financial instruction |
| Payment-prepared event | Oracle TxEventQ | Durable handoff from XA preparation to settlement |
| Settlement | payment rail / reconciliation ledger | Result reconciled by stable operation identity |

`invoice-history.json` is the source data for a duplicate query. A “duplicate
check clear” is not stored as a separate durable record; it is the result of
querying invoice history at the time of the precheck.

`events/payment-prepared-event.json` shows the JSON text carried by
`AP_PAYMENT_SETTLEMENT_EVENTS`. The MicroTx event handler maps this payload to
the `ap_payment_settlement` workflow input.

All values are fictitious demo data.
