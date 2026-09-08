-- Reset only mutable AP demo state. Reference suppliers, contracts, receipts,
-- bank controls, and historical duplicate data are intentionally retained.
DELETE FROM ap_payment_operations;

UPDATE ap_invoices
   SET status = 'RECEIVED',
       operation_id = NULL,
       amount = NULL,
       currency = NULL,
       scheduled_date = NULL,
       reason = NULL,
       updated_at = NULL;

COMMIT;
