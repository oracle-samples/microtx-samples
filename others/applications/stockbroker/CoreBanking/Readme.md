## Introduction

This is Core Banking application, which is used for managing the bank customer's transactions and admin operations.

#### Prerequisite
This application connects to XA supported database like Oracle.
If the database connection requires wallet, user can place the wallet configuration files inside the Database_Wallet directory which is in current directory.

And make the necessary JDBC URL changes as per the wallet configuration and update the `bank-datasource.url` field in `./CoreBanking/src/main/resources/application.yaml`

##### Branch Banking Database Initialization
Run the DDL create table queries and DML queries present in the `BankDB.sql` file, which is present in `CoreBanking` project and under `database` directory on CoreBanking database.

##### Example
JDBC URL with wallet
```
jdbc:oracle:thin:@tcps://<host>:<port>/<service_name>?wallet_location=Database_Wallet
```

JDBC URL without wallet
```
jdbc:oracle:thin:@tcps://<host>:<port>/<service_name>
```

## Docker

Build the docker image
```
docker image build --no-cache -t=core-banking .
```

User can use `build.sh` script as well to build the docker image. The script tags the built docker image and pushes it to container registry.
```
- Edit deploy.sh file in the current directory and update the <container-registry> host
- Execute the shell script with Tag version
    sh build.sh 1.0 
  "1.0" refers to tag
```