# Quick Start Guide

In this example, users will learn how to build and run a sample application quickly with Oracle Transaction Manager for Microservices using docker swarm.

The instructions provided in this section are specific to test or development environments. Do not use these instructions to set up and use Transaction Manager for Microservices in production environments.

## Prerequisites

Given are the official download links for all the prerequisite software. Guide links are also there for helping users to configure the software in their local system.

- **Docker** :
- Download Link https://docs.docker.com/get-docker/
- **Java/JDK**:
  - Guide link https://docs.oracle.com/en/java/javase/16/install/installation-jdk-macos.html
  - Download link  https://www.oracle.com/java/technologies/downloads/#jdk18-mac
  - ***For MacOs with M1 Chip please download Arm64 architecture***
- **Maven** :
  - Guide link  https://www.digitalocean.com/community/tutorials/install-maven-mac-os
  - Download Link https://maven.apache.org/download.cgi

## Install Docker Desktop and Set Up Docker Swarm

To run the Transaction manager and a sample application, you need:

1. A Docker Engine running in [swarm mode](https://docs.docker.com/engine/swarm/swarm-mode/).Please download docker from the link provided in  prerequisites section. If you’re not familiar with swarm mode, you might want to read [Swarm mode key concepts](https://docs.docker.com/engine/swarm/key-concepts/) and [How services work](https://docs.docker.com/engine/swarm/how-swarm-mode-works/services/).
2. Make sure that Swarm is enabled on your Docker Desktop by typing

   ```
   docker system info | grep Swarm
   ```

   Look for a message `Swarm: active` .
3. If Swarm isn’t running, simply type `docker swarm init` in a shell prompt to set it up

#### Set up a Docker registry

1. Start the registry as a service on your swarm:

   ```bash
   docker service create --name registry --publish published=5000,target=5000 registry:2
   ```
2. Check its status with ***docker service ls***:

   ```bash
   $ docker service ls
   ID             NAME                   MODE         REPLICAS   IMAGE                             PORTS
   tjc0u55yavu4   registry               replicated   1/1        registry:2                        *:5000->5000/tcp
   ```

   Once it reads **1/1** under **REPLICAS**, it’s running. If it reads **0/1**, it’s probably still pulling the image.
3. Check that it’s working with `curl`:

   ```
   $ curl http://localhost:5000/v2/
   {}
   ```

### Load the Transaction Manager image into the registry

The installation bundle contains the `tcs-docker-swarm.yaml` file, the configuration file of the transaction coordinator, which contains the deployment configuration details for Transaction Manager for Microservices. This file is located in the `installation_directory/otmm-RELEASE/otmm/docker-swarm` folder.

To make it easy for you to quickly set up Transaction Manager for Microservices and run sample applications, this configuration file does not contain data store, authentication, and authorization details. So you don't have to edit this file to provide details to connect to an external data store or any authentication details

1. Load the Transaction Manager for Microservices image in the local Docker repository. The Transaction Manager for Microservices image is located at `installation_directory/otmm-24.2.2/otmm/image/tmm-24.2.2.tgz`.

   ```bash
   cd installation_directory/otmm-24.2.2/otmm
   docker load < image/tmm-24.2.2.tgz
   ```

   On Windows, run the following command:

   ```bash
   cd installation_directory/otmm-24.2.2/otmm
   docker load -i image/tmm-24.2.2.tgz
   ```

   The following message is displayed: Loaded image: tmm:RELEASE
2. Create a tag for the above image to push it into the registry that you started for swarm.

   a. Use the following command to view the list of images in the local registry.

   ```bash
   docker images
   ```

   Example output:

   ```bash
   REPOSITORY                                                     TAG         IMAGE ID       CREATED         SIZE
   tmm                                                            24.2.2      bcc91ec952a6   4 days ago      610MB
   ```

   b. Use the following command to create a new tag.

   ```bash
   docker tag tmm:24.2.2 127.0.0.1:5000/tmm
   ```

   Here we are created the same image tmm  with a tag `127.0.0.1:5000/tmm`

   c. Push the image (new tag) to the registry.

   ```bash
   docker push 127.0.0.1:5000/tmm
   ```

# Deploy XA Sample Application

The XA sample application is available in the installation bundle in the `installation_directory/otmm-24.2.2/samples/xa/java` folder.

## Set Up Resource Managers

Set up resource managers for Department One and Department Two in your sample XA application.
For Department One and Department Two, you can use any XA-compliant database as a resource manager. For example, Autonomous Transaction Processing (ATP) Database instances in Oracle Cloud. Use two separate database instances for each of the two microservices.

If you use an Autonomous Database instance, perform the following steps to get the Oracle client credentials (wallet files):

1. Download the wallet from the Autonomous Database instance. See [Download Client Credentials (Wallets)](https://docs.oracle.com/en/cloud/paas/autonomous-database/adbsa/connect-download-wallet.html#GUID-B06202D2-0597-41AA-9481-3B174F75D4B1) in Using Oracle Autonomous Database on Shared Exadata Infrastructure.

   A ZIP file is downloaded to your local machine. Let's consider that the name of the wallet file is `Wallet_database.zip`.
2. Unzip the wallet file.

   ```bash
   unzip Wallet_database.zip
   ```

   1. The files are extracted to a folder. Note down the name of this folder.
   2. Copy the wallet files to the following folders that contain the source code for the participant applications. Perform this step for both ATP instance wallets for the two participant applications.
      - `installation_directory/otmm-24.2.2/samples/xa/java/department-helidon/Database_Wallet/ `
      - `installation_directory/otmm-24.2.2/samples/xa/java/department-spring/Database_Wallet/ `

## Create database and tables with sample values

To test the sample XA applications, create two databases and tables with sample values for both the department applications. The Transaction Manager for Microservices installation bundle includes the SQL script file that you can run to create the required tables.

To use the SQL script to create a database, a table and populate it with sample values:

1. Run the following SQL file using SQL Developer or SQL Plus for the first database:

   ```bash
   < installation_directory/otmm-24.2.2/samples/xa/java/department-helidon/department.sql
   ```

   This creates a database with the name `department_helidon` and a table with the name `accounts`. It also populates the `accounts` table with sample values.
2. Run the following SQL file using SQL Developer or SQL Plus for the second database:

   ```bash
   < installation_directory/otmm-24.2.2/samples/xa/java/department-spring/department.sql
   ```

This creates a database with the name `department_spring` and a table with the name `accounts`. It also populates the `accounts` table with sample values as provided in the following table.

| Account_ID | Amount |
| :--------- | :----- |
| account5   | 5000   |
| account4   | 4000   |
| account3   | 3000   |
| account2   | 2000   |
| account1   | 1000   |

## Build Docker Images for Sample XA Application

The XA sample application is available in the installation bundle in the `installation_directory/otmm-24.2.2/samples/xa/java` folder. This folder contains the code for three microservices, YAML file, and Helm charts.

Before you begin building the Docker images, ensure that you have copied the wallet files to the sample application folders if you are using an Autonomous Database instances as resource manager.
Perform the following steps to build Docker images for each microservice in the sample:

1. Run the following commands to build the Docker image for the teller application. Then, push the image to the docker registry after the build is completed

   ```bash
   cd installation_directory/otmm-24.2.2/samples/xa/java/teller
   docker image build -t 127.0.0.1:5000/teller:1.0 .
   docker push 127.0.0.1:5000/teller:1.0
   ```
2. Run the following commands to build the Docker image for the Department 1 application. Then, push the image to the docker registry after the build is completed.

   ```bash
   cd installation_directory/otmm-24.2.2/samples/xa/java/department-helidon
   docker image build -t 127.0.0.1:5000/department-helidon:1.0 .
   docker push 127.0.0.1:5000/department-helidon:1.0
   ```
3. Run the following commands to build the Docker image for the Department 2 application. Then, push the image to the docker registry after the build is completed.

   ```bash
   cd installation_directory/otmm-24.2.2/samples/xa/java/department-spring
   docker image build -t 127.0.0.1:5000/department-spring:1.0 .
   docker push 127.0.0.1:5000/department-spring:1.0
   ```

The Docker images that you have created are available in your local Docker container registry by default and then when pushed, they will be available in the docker registry that was created / started for swarm.

## Update the tmm-stack-compose.yaml File for XA

The sample application stack file also contains the deployment configuration details for the XA sample application.

While deploying the sample application to the docker swarm, update the `tmm-stack-compose.yaml` file by uncommenting the XA services, specify the image and provide details to access the resource managers - db connection string, username and password.

To provide the configuration and environment details in the `tmm-stack-compose.yaml` file:

1. Open the `tmm-stack-compose.yaml` file, which is located at `samples/xa/docker-compose/tmm-stack-compose.yaml`, in any code editor. This file contains the configuration details for the XA Sample App services. Uncomment the section for XA Services.
2. Provide details to access the database for dept1 and dept2 services.

   - DEPARTMENTDATASOURCE_URL: Enter the connect string to access the database.
   - DEPARTMENTDATASOURCE_USER: Enter the user name to access the database, such as `SYS`.
   - DEPARTMENTDATASOURCE_PASSWORD: Enter the password to access the database for the specific user.

   For information about identifying values for these fields, see [Distributed Transactions](https://docs.oracle.com/pls/topic/lookup?ctx=en/database/oracle/oracle-database/23/tmmdg&id=JJDBC-GUID-FD21627C-0183-4AF3-8719-8490F069A41E) in JDBC Developer's Guide and Reference.
3. Provide details of all the sample application images that you have in the docker registry. For example, 127.0.0.1:5000/teller:1.0
4. Save your changes.

```yaml
# ...
# ... # XA Sample Application (services) below (Uncomment and edit to run)
 
  dept1:
    image: "127.0.0.1:5000/department-helidon:1.0"
    ports:
      - "8086:8080"
    deploy:
      ...
    environment:
      ...
 
  dept2:
    image: "127.0.0.1:5000/department-spring:1.0"
    ports:
      - "8087:8082"
    deploy:
      ...
    environment:
      ...
 
  teller:
    image: "127.0.0.1:5000/teller:1.0"
    ports:
      - "8085:8080"
    deploy:
      ...
    environment:
      ...
```

## Deploy XA Sample Application

Deploy the XA sample application in the docker swarm where you have installed Transaction Manager for Microservices.

1.  Copy the tcs-docker-swarm.yaml file  from `installation_directory/otmm-RELEASE/otmm/docker-swarm/` to  `samples/xa/docker-compose`.

```bash
cp installation_directory/otmm-RELEASE/otmm/docker-swarm/tcs-docker-swarm.yaml  sample_app_directory/samples/xa/docker-compose
```

2. Run the following commands to deploy the XA sample application.

   ```bash
   cd samples/xa/docker-compose
   docker stack deploy -c tmm-stack-compose.yaml tmmdemo


   Output:
   Updating service tmmdemo_flight (id: qvzeovz8729yjg4e1y30b9f35)
   Updating service tmmdemo_trip-manager (id: m069vayql490qznmlwwdifmjx)
   Creating service tmmdemo_dept1
   Creating service tmmdemo_dept2
   Creating service tmmdemo_teller
   Updating service tmmdemo_otmm-tcs (id: ilkvx4emyv8cs1ei5cevsk2ui)
   Updating service tmmdemo_hotel (id: ifmqd521im28uswbrmzcghbo9)
   ```

   Where tmmdemo is the name of the docker stack that is installed.

   **Note : if you are not seeing ( id : qvzeovzXXXXXXXXXX9f35 ) in Output , then its ok**

   **Note : if you are facing any error in above command ,then you can use the below command and redo the first step **

   ```bash
   docker stack rm tmmdemo 
   ```
2. Verify that all services are ready. Use the following command to retrieve the list of services and their status.

   ```bash
   docker service ls
   ```
3. List of Services running

   ```bash
   ID             NAME                   MODE         REPLICAS   IMAGE                                   PORTS
   tjc0u55yavu4   registry               replicated   1/1        registry:2                              *:5000->5000/tcp
   varg9g3astj4   tmmdemo_dept1          replicated   1/1        127.0.0.1:5000/department-helidon:1.0   *:8086->8080/tcp
   ovtkx3677ypa   tmmdemo_dept2          replicated   1/1        127.0.0.1:5000/department-spring:1.0    *:8087->8082/tcp
   qvzeovz8729y   tmmdemo_flight         replicated   1/1        127.0.0.1:5000/flight:1.0               *:8083->8083/tcp
   ifmqd521im28   tmmdemo_hotel          replicated   1/1        127.0.0.1:5000/hotel:1.0                *:8082->8082/tcp
   ilkvx4emyv8c   tmmdemo_otmm-tcs       replicated   1/1        127.0.0.1:5000/tmm:latest               *:9000->9000/tcp
   jv80wxsehbd2   tmmdemo_teller         replicated   1/1        127.0.0.1:5000/teller:1.0               *:8085->8080/tcp
   m069vayql490   tmmdemo_trip-manager   replicated   1/1        127.0.0.1:5000/trip-manager:1.0  
   ```

## Run an XA Transaction

1. Before starting the transaction, run the following commands to check the balance in department 1 and department 2.

   ```bash
   curl --location --request GET http://127.0.0.1:8086/accounts/account1 | jq
   curl --location --request GET http://127.0.0.1:8087/accounts/account2 | jq
   ```
   Where,

   - 127.0.0.1:58059 is the external IP address and port of the Istio ingress gateway.
2. Transfer an amount of 50 from department 1 (account1) to department 2 (account2).

   ```bash
   curl --location --request POST 'http://127.0.0.1:8085/transfers' --header 'Content-Type: application/json' --data-raw '{"from" : "account1", "to" : "account2", "amount" : 50}'
   ```
3. Check balances in department 1 (account 111) to department 2 (account 222) to verify that the amounts reflect correctly after the transaction. Run the following commands to confirm the transaction.

   ```bash
   curl --location --request GET http://127.0.0.1:8086/accounts/account1 | jq
   curl --location --request GET http://127.0.0.1:8087/accounts/account2 | jq
   ```
4. Rollback Scenario: Transfer an amount of 50 from department 1 (account1) to a non-existent account in department 2 (account7). Since the account7 does not exist in department 2, the deposit will fail and the Transaction will rollback (which will rollback the withdraw).

   ```bash
   curl --location --request POST 'http://127.0.0.1:8085/transfers' --header 'Content-Type: application/json' --data-raw '{"from" : "account1", "to" : "account7", "amount" : 50}'
   ```
5. Check balances in department 1 (account1) to verify that the amounts reflect correctly and there was no withdrawal after the transaction. Run the following commands to confirm the transaction.

   ```bash
   curl --location --request GET http://127.0.0.1:8086/accounts/account1 | jq
   curl --location --request GET http://127.0.0.1:8087/accounts/account7 | jq
   ```