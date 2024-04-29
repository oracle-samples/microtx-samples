## Introduction

This is Stock Broker application, it provides trading options for the bank customer.

#### Prerequisite
This application connects to XA supported database like Oracle.
If the database connection requires wallet, user can place the wallet configuration files inside the Database_Wallet directory which is in current directory.

And make the necessary JDBC URL changes as per the wallet configuration and update the `stockbroker-datasource.url` field in `./StockBroker/src/main/resources/application.yaml`

##### Branch Banking Database Initialization
Run the DDL create table queries and DML queries present in the `StockBrokerDB.sql` file, which is present in `StockBroker` project and under `database` directory on StockBroker's database.

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
docker image build --no-cache -t=stockbroker .
```

User can use `build.sh` script as well to build the docker image. The script tags the built docker image and pushes it to container registry.
```
- Edit deploy.sh file in the current directory and update the <container-registry> host
- Execute the shell script with Tag version
    sh build.sh 1.0 
  "1.0" refers to tag
```