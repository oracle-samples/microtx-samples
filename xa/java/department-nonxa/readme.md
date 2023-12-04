## Introduction
Prerequisite

1. This application connects to an MongoDB as LLR (NonXA) participant.
2. A running instance of TMM transaction coordinator  

The generation of the executable jar file can be performed by issuing the following command

    mvn clean package

This will create an executable jar file **department-nonxa.jar** within the _target_ maven folder. This can be started by
executing the following commands
 
    export ORACLE_TMM_TCS_URL=<URL_OF_MTM_TRANSACTION_COORDINATOR>
    java -DdepartmentDataSource.url="mongodb://<host>:<port>/" -DdepartmentDataSource.name=<collectionname> -jar target/department-nonxa.jar

### Configurations

application.yaml in the resources folder can be used to provide the mongo db configurations.
department-nonxa.schema can be used to initialise database with test data.
Enable replication in mongodb by setting up the replica set. Follow official document for more info
https://www.mongodb.com/docs/manual/tutorial/convert-standalone-to-replica-set/?_ga=2.227687902.2115637302.1652975695-1870423324.1652975695

### Resources

/accounts is a JAX-RS rest endpoint that interact with the department database.
This endpoint will participant in the XA transaction managed by the Microservice Transaction Management Library.

## Docker

Add the required information in application.yaml under src/main/resources folder

Build the docker image.
```
- $ docker image build --network host -t <image_name>:<tag> .
```
Run the docker image.
```
- $ docker run -p 8085:8085 -d -e DB_URL=<dburl> -e DB_NAME=<dbname> <image_name>:<tag>
```