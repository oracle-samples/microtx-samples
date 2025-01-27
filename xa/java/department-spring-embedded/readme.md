## Introduction
### Prerequisite

1. Require Java 17 
2. A running instance of MTM transaction coordinator

### Embedded Database

The application includes preconfigured embedded databases. As the database is in-memory, the data must be loaded every time the application restarts.
To set the database as persistent file storage , change the JDBC connection String from `memory:mydb` to `mydb` in com.oracle.mtm.sample.XADataSourceConfig class

### Build Steps
The generation of the executable jar file can be performed by issuing the following command

    mvn clean package

This will create an executable jar file **department.jar** within the _target_ maven folder. This can be started by
executing the following commands

   
    export SPRING_MICROTX_COORDINATOR_URL=<URL_OF_MTM_TRANSACTION_COORDINATOR>
    java  -jar target/department.jar 


### Resources

/accounts is a Spring REST endpoint that interact with the department database.
This endpoint will participant in the XA transaction managed by the Microservice Transaction Management Library.

### Configurations

application.yaml in the resources folder can be used to provide the Microtx configurations.


## Docker
Build the docker image.
```
- $ docker build -t <image_name>:<tag> .
```
Run the docker image.
```
- $ docker run -p 8082:8082 -d <image_name>:<tag>
```