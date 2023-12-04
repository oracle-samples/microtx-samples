## Introduction
Prerequisite

1. This application connects to the Mysql Database as LRC(Last Resource Committer) NonXA participant.
2. A running instance of TMM transaction coordinator  

The generation of the executable jar file can be performed by issuing the following command

    mvn clean package

This will create an executable jar file **department-nonxa-ds.jar** within the _target_ maven folder. This can be started by
executing the following commands

    export DEPARTMENTDATASOURCE_PASSWORD=<password>
    export ORACLE_TMM_TCS_URL=<URL_OF_MTM_TRANSACTION_COORDINATOR>
    java -DdepartmentDataSource.url="<database_url>" -DdepartmentDataSource.user=<user> -jar target/department-nonxa-ds.jar 

### Configurations

application.yaml in the resources folder can be used to provide the database configurations.
department-nonxa-lrc-ds.sql can be used to initialise database with test data.


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
- $ docker run -p 8086:8086 -d -e DEPARTMENTDATASOURCE_URL=<dburl> -e DEPARTMENTDATASOURCE_USER=<user> -e DEPARTMENTDATASOURCE_PASSWORD=<password> <image_name>:<tag>
```