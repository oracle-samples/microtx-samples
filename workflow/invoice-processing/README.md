# Invoice processing (OCR + GenAI + Human review)

![Invoice processing workflow](./invoice_processing.png)

This sample turns an invoice image into structured fields, optionally routes to a human for validation, then stores the result and publishes an event.

## What it does

1. **OCR**: Calls OCR.space on the invoice image URL.
2. **Extract**: Uses a GenAI task to extract invoice fields and return strict JSON.
3. **Decide**: If extraction is incomplete → **HUMAN** review; else continue.
4. **Persist**: Inserts the final invoice into `INVOICES`.
5. **Notify**: Publishes an EventQ message with the `invoiceId`.

## Files

- [invoice_processing_workflow.json](./invoice_processing_workflow.json)

## Start payloads

Normal path (AI returns `VALID`):

```json
{
  "invoiceId": "1",
  "url": "https://objectstorage.us-ashburn-1.oraclecloud.com/n/oabcs1/b/microtx-conductor/o/sampleinvoice.png",
  "sourceSystem": "ONLINE"
}
```

Human-in-the-loop path (AI returns `NEEDS_REVIEW`):

```json
{
  "invoiceId": "2",
  "url": "https://objectstorage.us-ashburn-1.oraclecloud.com/n/oabcs1/b/microtx-conductor/o/sampleinvoice-2.png",
  "sourceSystem": "ONLINE"
}
```

## Notes / prerequisites

- OCR uses an OCR.space test key (`apikey: helloworld`). If you hit rate limits, generate your own API key at https://ocr.space/.
- Configure the referenced profiles/connectors:
  - GenAI: `genai-invoice-profile` (LLM profile `oci_models`)
  - DB: `oracle-db-profile` and table `INVOICES`
  - EventQ topic: `INVOICE_EVENT_Q`

### Create database connector
1. From the left pane, click **Connectors**.
2. Select the database connector from the list.
3. Click the **+** icon in the top-right corner.
4. Fill in the connector form:
   - Name: `oracle-db-profile`
   - Engine: Oracle
   - Capabilities: RELATIONAL
   - Username: `<database-username:app_user>`
   - Password: `<database-password>`
   - JDBC URL: `jdbc:oracle:thin:@tcps://<host>:<port>/<service_name>`
   - Wallet: `<wallet-file>`

Wallet is optional; provide it only if your database connection requires a wallet file upload.

## Database Prerequisites

Create a dedicated schema user and grant the required permissions.

> **Note:** `app_user` is the Oracle **database user/schema name** used in the examples below. Replace it with your preferred username if needed.

### Schema user creation + object privileges

```sql
CREATE USER app_user IDENTIFIED BY "<Password>" DEFAULT TABLESPACE users QUOTA UNLIMITED ON users;
GRANT CREATE SESSION, CREATE TABLE, CREATE PROCEDURE, CREATE VIEW, CREATE SEQUENCE, CREATE TYPE TO app_user;
COMMIT;
```

### TxEventQ (required permissions)

```sql
GRANT SELECT ON SYS.V_$SESSION     TO app_user;
GRANT SELECT ON SYS.V_$LOCK        TO app_user;
GRANT SELECT ON SYS.V_$TRANSACTION TO app_user;

grant aq_user_role to app_user;
grant execute on dbms_aq to app_user;
grant execute on dbms_aqadm to app_user;
grant execute ON dbms_aqin TO app_user;
grant execute ON dbms_aqjms TO app_user;
grant execute on dbms_teqk to app_user;

-- Needed if the user should query DBA_QUEUES (instead of USER_QUEUES)
grant select on sys.dba_queues to app_user;
commit;
```

## Create the EventQ topic

Run on the target database (once):

```sql
BEGIN
  DBMS_AQADM.CREATE_TRANSACTIONAL_EVENT_QUEUE(
    queue_name         => 'INVOICE_EVENT_Q',
    multiple_consumers => TRUE
  );
END;
/

BEGIN
  DBMS_AQADM.START_QUEUE(
    queue_name => 'INVOICE_EVENT_Q'
  );
END;
/
```

## Create the `INVOICES` table

```sql
CREATE TABLE INVOICES (
    invoice_id      VARCHAR2(100),
    biller          VARCHAR2(255),
    address         VARCHAR2(500),
    amount_due      NUMBER(12,2),
    currency        VARCHAR2(10),
    due_date        VARCHAR2(20),
    source_file     VARCHAR2(1000),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```