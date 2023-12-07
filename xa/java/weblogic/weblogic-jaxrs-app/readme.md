## Introduction
This is a participant application (microservice) that provides an accounts service to withdraw amount from an account and deposit amount to an account.
This application used the MicroTx Java Library for XA and participates in an XA Transaction that is coordinated by the MicroTx Coordinator. This application to be deployed on WebLogic 
Server and uses the WebLogic Server Interposed Transaction Manager API to coordinate the transaction across WebLogic and MicroTx coordinator.

### Prerequisite

1. This application connects to an Oracle Database via the WebLogic Data source with name "orcladwds". Make sure to create WebLogic XA Datasource with name "orcladwds"
2. A running instance of MicroTx transaction coordinator  

The generation of the war file can be performed by issuing the following command

    mvn clean package

This will create a war file **weblogic-jaxrs-app.war** within the _target_ maven folder. This war package can be deployed on Java EE application supported containers like Weblogic Server.

### Configurations

weblogic-jaxrs-app.sql can be used to initialise database with test data.


### Resources

/accounts is a JAX-RS rest endpoint that interact with the department database.
This endpoint will participant in the XA transaction managed by the Microservice Transaction Management Library.
