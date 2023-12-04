## Introduction
This is a participant application (microservice) that provides an accounts service to withdraw amount from an account and deposit amount to an account.
This application used the TMM Java Library for XA and participates in an XA Transaction that is coordinated by the TMM Coordinator.

### Prerequisite

1. This application connects to an Oracle Database. If you choose to use Autonomous database, then download the client credential wallet and copy the contents into the Database_Wallet folder
in the root director
2. A running instance of TMM transaction coordinator  

The generation of the executable jar file can be performed by issuing the following command

    mvn clean package

This will create an executable jar file **department.jar** within the _target_ maven folder. This can be started by
executing the following commands

    export DEPARTMENTDATASOURCE_PASSWORD=<password>
    export ORACLE_TMM_TCS_URL=<URL_OF_MTM_TRANSACTION_COORDINATOR>
    java -DdepartmentDataSource.url="<database_url>?wallet_location=Database_Wallet" -DdepartmentDataSource.user=<user> -jar target/department.jar 

### Configurations

application.yaml in the resources folder can be used to provide the database configurations.
department.sql can be used to initialise database with test data.


### Resources

/accounts is a JAX-RS rest endpoint that interact with the department database.
This endpoint will participant in the XA transaction managed by the Microservice Transaction Management Library.

## Docker
Build the docker image.
```
- $ docker build --network host -t <image_name>:<tag> .
```
Run the docker image.
```
- $ docker run -p 8080:8080 -d -e DEPARTMENTONEENDPOINT=<department_one_url> -e DEPARTMENTTWOENDPOINT=<department_two_url> <image_name>:<tag>
```