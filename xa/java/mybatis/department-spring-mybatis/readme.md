## Introduction
Prerequisite

1. This application connects to an Oracle Database. If you choose to use Autonomous database, then download the client credential wallet and copy the contents into the Database_Wallet folder
   in the root director 
2. A running instance of MTM transaction coordinator

The generation of the executable jar file can be performed by issuing the following command

    mvn clean package

This will create an executable jar file **department.jar** within the _target_ maven folder. This can be started by
executing the following commands

    export DEPARTMENTDATASOURCE_PASSWORD=<PASSWORD>
    export SPRING_MICROTX_COORDINATOR_URL=<URL_OF_MTM_TRANSACTION_COORDINATOR>
    java -DdepartmentDataSource.url=<database_url> -DdepartmentDataSource.user=<user> -jar target/department-spring-mybatis.jar 


### Resources

/accounts is a Spring REST endpoint that interact with the department database.
This endpoint will participant in the XA transaction managed by the Microservice Transaction Management Library.

### Configurations

application.yaml in the resources folder can be used to provide the database configurations.
department.sql can be used to initialise data in the database.

## Docker
Add the required information in application.yaml under src/main/resources folder

Add  wallet files for oracle atp/adw instances under Database_Wallet folder , ignore for other database

Build the docker image.
```
- $ docker build -t <image_name>:<tag> .
```
Run the docker image.
```
- $ docker run -p 8081:8081 -d <image_name>:<tag>
```