## Introduction
Prerequisite

1. This application connects to an Oracle Database. If you choose to use Autonomous database, then download the client credential wallet and copy the contents into the Database_Wallet folder
in the root director
2. A running instance of TMM transaction coordinator  

The generation of the executable jar file can be performed by issuing the following command

    mvn clean package

This will create an executable jar file **teller-as-participant.jar** within the _target_ maven folder. This can be started by
executing the following commands

    export FEEDATASOURCE_PASSWORD=<password>
    export ORACLE_TMM_TCS_URL=<URL_OF_TMM_TRANSACTION_COORDINATOR>
    java -DfeeDataSource.url="<database_url>?wallet_location=Database_Wallet" -DfeeDataSource.user=<user> -jar target/teller-as-participant.jar 

### Configurations

application.yaml in the resources folder can be used to provide the database configurations.
transfer-fee.sql can be used to initialise database with test data.


### Resources

/transfer is a JAX-RS rest endpoint to initiate a transfer.
This endpoint will start and participant in the XA transaction managed by the Microservice Transaction Management Library.

## Docker
Add the required information in application.yaml under src/main/resources folder

Add  wallet files for oracle atp/adw instances under Database_Wallet folder , ignore for other database

Build the docker image.
```
- $ docker build -t <image_name>:<tag> .
```
Run the docker image.
```
- $ docker run -p 8080:8080 -d <image_name>:<tag>
```