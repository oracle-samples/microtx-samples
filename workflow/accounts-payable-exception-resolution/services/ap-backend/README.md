# AP Backend XA Participant

`ap-backend` runs on port `8083`. It owns the AP system-of-record data and
provides deterministic prechecks, planner evidence reads, evidence verification,
business policy, and the AP-side XA write that marks an invoice as scheduled.

Its `POST /invoices/{invoiceId}/payment-scheduled` endpoint uses the
MicroTx-managed `microTxSqlConnection`. When MicroTx Workflows propagates an
XA transaction, that write enlists as the AP branch.

## Configure

Supply configuration as standard Spring environment variables before startup:

```bash
export AP_DATABASE_URL='jdbc:oracle:thin:@//db-host:1521/service_name'
export AP_DATABASE_USERNAME='AP_BACKEND'
export AP_DATABASE_PASSWORD='...'
export MICROTX_COORDINATOR_URL='http://127.0.0.1:9000/api/v1'
export AP_MICROTX_XA_RESOURCE_MANAGER_ID='5BFC0C43-5207-4B1F-8D16-A0B7A6B5A803'
```

Optional properties:

```bash
export SERVER_PORT=8083
export MICROTX_PARTICIPANT_URL='http://127.0.0.1:8083'
export MICROTX_XA_TRANSACTION_TIMEOUT=300000
export POLICY_APPROVAL_THRESHOLD=100000
export AP_DATABASE_POOL_NAME='apBackendXaPool'
export AP_DATABASE_DATASOURCE_NAME='apBackendXaDataSource'
export AP_DATABASE_CONNECT_TIMEOUT_SECONDS=10
```

`MICROTX_XA_TRANSACTION_TIMEOUT` is milliseconds. Keep the resource-manager ID
unique to this service; do not reuse the payment service ID.
`AP_DATABASE_CONNECT_TIMEOUT_SECONDS` controls the startup database check.

For Autonomous Database, provide its wallet-aware JDBC URL and configure the
Oracle JDBC wallet in the normal way for the process (usually
`TNS_ADMIN=/absolute/path/to/Wallet_name`). The build includes Oracle's wallet
libraries (`oraclepki`, `osdt_core`, and `osdt_cert`) required for
`cwallet.sso`.

## Initialise the database

Run these scripts as the AP schema owner, in order:

```text
database/schema.sql
database/demo-data.sql
```

The second script loads the six sample scenarios. Do not run it in a production
schema.

`run-local.sh` does not run either script automatically. Schema creation and
seeding are deliberate one-time environment setup, not application startup
behavior.

## Reset between demo runs

An exact rerun with the same `operationId` is safe and returns
`OPERATION_ALREADY_PROCESSED`; a different operation ID for an invoice already
scheduled is rejected. To reset mutable AP state for a completely fresh demo,
run `database/reset-demo-state.sql` as this schema owner. It retains all
reference evidence and historical duplicate records.

## Start

From the sample root, the preferred path is:

```bash
./run-local.sh
```

It builds this project if needed and starts the service as a background process.
The log is `.local-run/ap-backend.log`.

To build and start only this service:

```bash
mvn -q -DskipTests package
java -jar target/ap-backend.jar
```

The MicroTx Java distribution must have installed
`com.oracle.microtx:microtx-spring-boot-starter:1.0-SNAPSHOT` in the Maven
repository. This is the same dependency used by the existing Java XA samples.

All environment properties can instead be passed as Spring arguments, for
example:

```bash
java -jar target/ap-backend.jar \
  --ap.datasource.url='jdbc:oracle:thin:@//db-host:1521/service_name' \
  --ap.datasource.username=AP_BACKEND \
  --ap.datasource.password='...'
```

## Stop

When started by the shared runner, stop it with:

```bash
./run-local.sh stop
```

This stops `ap-backend`, `payment-service`, and `bank-mock` together.
