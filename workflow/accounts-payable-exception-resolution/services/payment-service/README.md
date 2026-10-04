# Payment Service XA Participant

`payment-service` runs on port `8084`. It persists payment instructions. Its
`POST /payment-instructions` endpoint uses the MicroTx-managed
`microTxSqlConnection`; within the main workflow's XA boundary it enlists as
the payment branch, alongside `ap-backend`.

The external bank call is intentionally not here. It is made after commit by
the separate payment-settlement workflow through `bank-mock`.

## Configure

Set the standard Spring environment variables before startup:

```bash
export PAYMENT_DATABASE_URL='jdbc:oracle:thin:@//db-host:1521/service_name'
export PAYMENT_DATABASE_USERNAME='PAYMENT_SERVICE'
export PAYMENT_DATABASE_PASSWORD='...'
export MICROTX_COORDINATOR_URL='http://127.0.0.1:9000/api/v1'
export PAYMENT_MICROTX_XA_RESOURCE_MANAGER_ID='65A79F32-E6A6-4AFE-89B6-45F0E70C7418'
```

Optional properties:

```bash
export SERVER_PORT=8084
export MICROTX_PARTICIPANT_URL='http://127.0.0.1:8084'
export MICROTX_XA_TRANSACTION_TIMEOUT=300000
export PAYMENT_DATABASE_POOL_NAME='paymentXaPool'
export PAYMENT_DATABASE_DATASOURCE_NAME='paymentXaDataSource'
export PAYMENT_DATABASE_CONNECT_TIMEOUT_SECONDS=10
```

The XA resource-manager ID must be different from the AP backend's ID, even
when the schemas are hosted by the same Oracle Database instance.

For Autonomous Database, export `TNS_ADMIN=/absolute/path/to/Wallet_name` for
the shell that starts the sample. The build includes the Oracle wallet
libraries required to read `cwallet.sso`.

Set `SIMULATE_FAILURE=true` only for the rollback demo. The service writes its
instruction and then returns HTTP 500, so TCS must roll back both XA branches.

## Initialise the database

Run `database/schema.sql` as the payment-service schema owner.

The shared startup script never creates or seeds database tables. For a fresh
repeatable demo, run `database/reset-demo-state.sql` as this schema owner after
running the matching AP reset script. It deletes only workflow-created payment
instructions.

## Start

From the sample root, start all required local services:

```bash
./run-local.sh
```

This builds the jar when sources changed, starts this service in the background,
and writes its log to `.local-run/payment-service.log`.

To run only this service:

```bash
mvn -q -DskipTests package
java -jar target/payment-service.jar
```

The MicroTx Java distribution must have installed the
`microtx-spring-boot-starter` Maven artifact, as used by the repository's Java
XA samples. Every environment variable also has a Spring property equivalent;
for example use `--payment.datasource.url=...` with `java -jar`.

## Stop

For processes started by the shared runner:

```bash
./run-local.sh stop
```

It stops both Java participants and the bank mock.
