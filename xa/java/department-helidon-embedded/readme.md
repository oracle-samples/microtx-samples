## Introduction
This is a participant application (microservice) that provides an accounts service to withdraw amount from an account and deposit amount to an account.
This application used the TMM Java Library for XA and participates in an XA Transaction that is coordinated by the TMM Coordinator.

## Embedded Database 

The application includes preconfigured embedded databases. Default database is in-memory, the data must be loaded every time the application restarts.
To set the database as persistent file storage , change the JDBC connection String from `memory:mydb` to `mydb` in com.oracle.mtm.sample.Configuration class 

### Prerequisite

1. Require Java 17
2. A running instance of TMM transaction coordinator

The generation of the executable jar file can be performed by issuing the following command

    mvn clean package

This will create an executable jar file **department.jar** within the _target_ maven folder. This can be started by
executing the following commands

    export ORACLE_TMM_TCS_URL=<URL_OF_MTM_TRANSACTION_COORDINATOR>
    java -jar target/department.jar 

### Configurations

tmm.properties is used to configure data for TMM library

### Resources

/accounts is a JAX-RS rest endpoint that interact with the department database.
This endpoint will participant in the XA transaction managed by the Microservice Transaction Management Library.

## Docker

Build the docker image.
```
- $ docker build -t <image_name>:<tag> .
```
Run the docker image.
```
- $ docker run -p 8081:8081 -d <image_name>:<tag>
```