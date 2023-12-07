## Introduction

The generation of the executable jar file can be performed by issuing the following command

    mvn clean package

This will create an executable jar file **teller.jar** within the _target_ maven folder. This can be started by
executing the following command

    export ORACLE_TMM_TCS_URL=<URL_OF_MTM_TRANSACTION_COORDINATOR>
    java -jar -DdepartmentOneEndpoint=<department_one_url> -DdepartmentTwoEndpoint=<department_two_url> target/teller.jar

## Configuration

The Application.yaml file contains the endpoints of the two microservices that participate in the XA transaction 
coordinated by the Microservice Transaction Management.

## Resources

/transfers endpoint is used to transfer a certain amount from one account to another across microservices.
This endpoint will be the XA transaction initiator.

Open API specification can be found at the endpoint /openapi

## Docker
Build the docker image.
```
- $ docker build --network host -t <image_name>:<tag> .
```
Run the docker image.
```
- $ docker run -p 8080:8080 -d -e DEPARTMENTONEENDPOINT=<department_one_url> -e DEPARTMENTTWOENDPOINT=<department_two_url> <image_name>:<tag>
```








