CREATE TABLE payment_instructions (
  instruction_id VARCHAR2(64) PRIMARY KEY,
  idempotency_key VARCHAR2(100) NOT NULL UNIQUE,
  operation_id VARCHAR2(100) NOT NULL UNIQUE,
  invoice_id VARCHAR2(64) NOT NULL,
  supplier_id VARCHAR2(64) NOT NULL,
  amount NUMBER(14,2) NOT NULL,
  currency VARCHAR2(3) NOT NULL,
  status VARCHAR2(32) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
