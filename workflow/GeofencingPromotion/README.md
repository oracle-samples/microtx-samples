# Geofenced Promotion (DB scripts)

## How this Works – Abstract & Step-by-Step

This system enables retailers to automatically trigger personalized, location-based promotions as soon as a user enters a geofence (e.g., Downtown Mall) – with all business logic orchestrated as a MicroTx Workflow driven by Oracle Transactional Event Queue (TxEventQ) events.

## How to Start the Frontend (Flask) Server

To run the Flask web application that provides the map UI and handles geofence event publishing and notification polling, see [flask-server/README.md](flask-server/README.md) for complete setup and startup instructions.

**Overview:**
- The mobile app sends the user’s location to the backend when they enter/approach a geofenced area.
- The backend stores the location event in the database and publishes an event (with user, location, and event details) to Oracle TxEventQ.
- MicroTx Workflow Server consumes this event and runs a pipeline:
    1. **Check Geofence Containment** – Is this location inside any active geofence zone?
    2. **Evaluate Promotion Eligibility** – Is the user opted in, is the promotion active, does their loyalty tier qualify?
    3. **Log Workflow Steps** – Audit the user, location, geofence/promo check results.
    4. **Load Promotion Message + User Context** – Fetch promo text, user details for personalization.
    5. **Personalize (AI, if enabled)** – Optionally rewrite the message using GenAI.
    6. **Send Notification** – Deliver personalized notification to the user.
    7. **End, or log "no match"/"not eligible"** if not eligible/geofenced.

**End-to-End Example:**
- Alice approaches Downtown Mall. Her app sends her latest location.
- System checks if Alice is inside a promotional geofence.
- If yes, workflow checks her eligibility for 10% off at Downtown Mall.
- If eligible: a notification (“Hi Alice! Since you’re near Downtown Mall, enjoy 10% off today!”) is delivered instantly.
- All actions are logged for analysis.

**What this demonstrates:**
- Event-driven workflow integrating spatial/geofence business rules, promotion eligibility logic, message personalization (via GenAI), DB audit logging, and real-time notification delivery.
- Easily extensible for many stores, zones, promotions, and user segments.

---

This folder contains Oracle SQL scripts for the **Geofenced Promotion Trigger** demo (tables, functions, stored procedures, seed data).

## Prerequisites

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
-- 1. Create the EventQ topic (multi-consumer, text message)
BEGIN
  DBMS_AQADM.CREATE_TRANSACTIONAL_EVENT_QUEUE(
    queue_name         => 'NOTIFICATION_TOPIC',
    multiple_consumers => TRUE
  );
END;
/

-- 2. Start the queue/topic
BEGIN
  DBMS_AQADM.START_QUEUE(
    queue_name => 'NOTIFICATION_TOPIC'
  );
END;
/

-- 3. Add a subscriber agent so messages have a recipient (MANDATORY for enqueue to work!)
BEGIN
  DBMS_AQADM.ADD_SUBSCRIBER(
    queue_name => 'NOTIFICATION_TOPIC',
    subscriber => SYS.AQ$_AGENT('my_subscriber', NULL, NULL)
  );
END;
/
```

**Note:**  
If you *skip step 3* (subscriber), publishing an event from the app will fail with  
`ORA-24033: no recipients for message`.<br>
For debugging, you can check subscribers like this:
```sql
SELECT * FROM USER_QUEUE_SUBSCRIBERS WHERE queue_name = 'NOTIFICATION_TOPIC';
```

## Run order

1. Create tables:
```sql
@sql/01_tables.sql
```

2. Create functions:
```sql
@sql/02_functions.sql
```

3. Create stored procedures:
```sql
@sql/03_stored_procedures.sql
```

4. Load seed data:
```sql
@sql/04_seed_data.sql
```

## Notes

- These scripts create objects in the **current schema** (whatever user/schema you run them as).
- `sql/04_seed_data.sql` inserts promotions and uses `INSERT ... RETURNING` to capture the generated `promotion_id` values, then inserts geofences using those IDs (no hardcoded IDs).
- `sql/99_cleanup.sql` ignores "object does not exist" errors so it is safe to run multiple times.

---

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


## Create the Event Handler

To link the EventQ topic with your workflow, create an Event Handler as follows:

1. In the left navigation pane, go to **Definitions**.
2. Click the **+** icon to add a new event handler.
3. Complete the form fields as shown below:
   - **Name:** `geofence_events`
   - **Queue Type:** `txeventq`
   - **Queue Name:** `NOTIFICATION_TOPIC`
   - **Publisher Name:** `my_subscription`
   - **DB Profile:** `oracle-db-profile`
   - **Active:** Enabled
   - **Type:** `Start Workflow`
   - **Workflow Name:** `geofenced_promotion_trigger_workflow_v2`
   - **Version:** Latest (select from dropdown)
4. For **Input (JSON)**, paste the following:
```json
{
  "userId": "${payload.userId}",
  "eventId": "${payload.eventId}",
  "latitude": "${payload.latitude}",
  "longitude": "${payload.longitude}",
  "timestamp": "${payload.timestamp}",
  "sourceSystem": "${payload.sourceSystem}",
  "notificationBaseUri": "${payload.notificationBaseUri}"
}
```

Once configured and enabled, this event handler will trigger the workflow automatically whenever a new event is published to the NOTIFICATION_TOPIC queue.


## Create the Prompt Template

To enable message personalization using agentic AI, create a Prompt Template as follows:

1. Open the **Agentic AI** section in the left navigation pane.
2. Go to the **Prompt Template** tab and click the **+** icon to add a new template.
3. In the form, fill out the fields as follows:
   - **Name:** `geofence_promotion_prompt`
   - **Prompt Text:**  
     Copy and paste the following template:

```
You are generating a short, friendly, personalized retail promotion notification.

Customer details:
- Name: ${p_user_name}
- Loyalty tier: ${p_loyalty_tier}

Promotion details:
- Promotion name: ${p_promotion_name}
- Default message: ${p_message_text}
- Eligibility reason: ${p_reason}

Instructions:
- Rewrite the promotion message in a concise, personalized way.
- Keep it under 40 words.
- Be friendly and promotional, but not overly salesy.
- Mention the user's first name if available.
- Optionally, add suitable emojis.
```

When saved, this prompt template will ensure all notifications are concise, friendly, and personalized for each customer.
