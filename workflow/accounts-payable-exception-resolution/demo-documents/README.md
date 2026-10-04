# Demo business documents

The workflow starts from structured invoice input; it does not perform OCR or
document extraction. These are visual aids for a demo, representing business
documents that explain the source records.

Keep or generate only these document-like artifacts:

| Artifact | Role in the demo | System fact it supports |
|---|---|---|
| Supplier invoice | Supplier-submitted business document | Invoice amount and freight line |
| Purchase order | Procurement commitment | Ordered amount and supplier |
| Goods receipt | Receiving evidence | Receipt completion |
| Contract excerpt | Contractual evidence | Freight allowance |
| Supplier bank-change notice | Supplier request form/notice | Origin of the requested master-data change |

Do not present the following as PDFs. They are persistent records or derived
query results and belong under [`../demo-data`](../demo-data): bank
verification, payment instruction, settlement/reconciliation status, and
invoice history. A duplicate-check result is derived at runtime from invoice
history; it is not a source document.

`AP_Exception_Demo_Documents.zip` can supply the visual source material. Its
payment-instruction, duplicate-check, bank-verification, and settlement PDFs
should be replaced in a demo pack by the corresponding structured records in
`demo-data`.
