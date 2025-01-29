## Introduction
Prerequisite

1. This application connects to an Oracle Database. If you choose to use Autonomous database, then download the client credential wallet and copy the contents into the Database_Wallet folder
   in the root director 
2. A running instance of MTM transaction coordinator

The generation of the executable jar file can be performed by issuing the following command

    mvn clean package

This will create an executable jar file **teller-spring.jar** within the _target_ maven folder. This can be started by
executing the following commands

    export ORACLE_TMM_TCS_URL=<URL_OF_MTM_TRANSACTION_COORDINATOR>
    java -jar -DdepartmentOneEndpoint=<department_one_url> -DdepartmentTwoEndpoint=<department_two_url> -jar target/teller-spring.jar 



### Resources

/transfer is a JAX-RS rest endpoint to initiate a transfer.
This endpoint will participant in the XA transaction managed by the Microservice Transaction Management Library.

### Configurations

application.yaml in the resources folder can be used to provide the database configurations.
transfer-fee.sql can be used to initialise data in the database.

## Docker
Build the docker image.
```
- $ docker build --network host -t <image_name>:<tag> .
```
Run the docker image.
```
- $ docker run -p 8080:8080 -d -e DEPARTMENTONEENDPOINT=<department_one_url> -e DEPARTMENTTWOENDPOINT=<department_two_url> <image_name>:<tag>
```

## Open the transfer app in browser 
```
http://localhost:8080
```