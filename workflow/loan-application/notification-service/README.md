# Notification Service

This is a Spring Boot based Notification Service for sending emails using a REST API.

## Build

Run the following command to build the project (skip tests):

```
mvn clean package -DskipTests
```

## Run

After building, you can run the application with either Java or Docker.

**With Java (local run):**
```
java -jar target/notification-service-0.0.1.jar
```
The service will start on port **8085** as configured in `application.yaml`.

**With Docker:**
```
docker run --rm -p 8085:8085 notification-service:latest
```
The service will be available at [http://localhost:8085/notification-service/](http://localhost:8085/notification-service/).

## TxEventQ Message Viewer

The application serves an unsecured message-viewer page at [http://localhost:8085/notification-service/](http://localhost:8085/notification-service/). It displays the newest pending messages for one configured Oracle TxEventQ consumer (10 by default), formats JSON payloads when expanded, and has an explicit **Consume** action for each row. It does not publish messages, create queues, or create subscribers.

TxEventQ viewing is disabled by default, so Oracle database settings are not needed for normal notification-service startup. Enable it only in the deployment that needs queue viewing:

```sh
export TXEVENTQ_ENABLED=true
export TXEVENTQ_JDBC_URL='jdbc:oracle:thin:@tcps://<host>:1522/<service>?wallet_location=<wallet-directory>'
export TXEVENTQ_USERNAME='<queue-owner-user>'
export TXEVENTQ_PASSWORD='<password>'
export TXEVENTQ_QUEUE_NAME='LOAN_APPLICATION_EVENTS'
export TXEVENTQ_CONSUMER_NAME='<existing-consumer-name>'
# Optional; defaults to 10 and accepts 1 through 1000.
export TXEVENTQ_MAX_MESSAGES=10
```

For a non-TCPS database, set `TXEVENTQ_JDBC_URL` to the normal Oracle JDBC URL. For TCPS/wallet connections, keep the wallet location in the supplied JDBC URL as shown above. Do not commit credentials or a real wallet path.

The configured database user is assumed to own the queue. It needs access to the `AQ$<queue-name>` view and dequeue privileges for the existing configured consumer. The viewer queries only `READY` rows for that consumer and consumes a selected message through `DBMS_AQ.DEQUEUE`.

The public viewer APIs are:

- `GET /notification-service/api/txeventq/messages`
- `POST /notification-service/api/txeventq/messages/{messageId}/consume`


## Send Email (Examples)

### 1. Test Email

```sh
curl -X POST http://localhost:8085/notification-service/email-service/sendMail?isMockSendMail=true \
  -H "Content-Type: application/json" \
  -d '{
    "from": "microtx.user@localhost",
    "to": "microtx.user@microtx.com",
    "cc": "",
    "subject": "Test Email",
    "body": "This is a test email from Spring Boot using local Postfix.",
    "isEmailBodyText": true
  }'
```

### 2. Loan Approval Request

```sh
curl -X POST http://localhost:8085/notification-service/email-service/sendMail \
  -H "Content-Type: application/json" \
  -d '{
    "from": "loan.manager@localhost",
    "to": "microtx.user@microtx.com",
    "cc": "",
    "subject": "Loan Approval Request",
    "body": "A new loan application (ID: 100456) requires your approval. Applicant: John Doe. Amount: $10,000. Please review and take appropriate action.",
    "isEmailBodyText": false
  }'
```

### 3. Loan Approval Status

```sh
curl -X POST http://localhost:8085/notification-service/email-service/sendMail \
  -H "Content-Type: application/json" \
  -d '{
    "from": "loan.manager@microtx.com",
    "to": "microtx.user@microtx.com",
    "cc": "",
    "subject": "Loan Application Status",
    "body": "Dear John Doe,\n\nYour loan application (ID: 100456) has been approved.\n\nThank you for choosing MicroTx Bank.",
    "isEmailBodyText": true
  }'
```

- Set `isEmailBodyText` to `false` for HTML-formatted emails (uses a professional template).
- Set CC to a valid email if you want to send a carbon copy, or leave it as an empty string.

## Requirements

- Java 17+ (or compatible with your Spring Boot setup)
- Maven 3.9+
- Local SMTP server (e.g. Postfix on localhost:25, authentication disabled for development)

Review `src/main/resources/application.yaml` for further SMTP configuration.
