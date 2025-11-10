# Notification Service

This is a Spring Boot based Notification Service for sending emails using a REST API.

## Build

Run the following command to build the project (skip tests):

```
./gradlew clean build -x test
```

## Run

After building, you can run the application with either Java or Docker.

**With Java (local run):**
```
java -jar build/libs/notification-service-0.0.1.jar
```
The service will start on port **8085** as configured in `application.yaml`.

**With Docker:**
```
docker run --rm -p 8085:8085 notification-service:latest
```
The service will be available at [http://localhost:8085](http://localhost:8085).


## Send Email (Examples)

### 1. Test Email

```sh
curl -X POST http://localhost:8085/email-service/sendMail?isMockSendMail=true \
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
curl -X POST http://localhost:8085/email-service/sendMail \
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
curl -X POST http://localhost:8085/email-service/sendMail \
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
- Local SMTP server (e.g. Postfix on localhost:25, authentication disabled for development)

Review `src/main/resources/application.yaml` for further SMTP configuration.
