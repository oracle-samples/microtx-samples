# About the Teller Microservice

When you run the Bank Transfer application, the Teller microservice initiates the transactions so it is called a transaction initiator service. The user interacts with this microservice to transfer money between Departments One and Two. When a new request is created, the helper method that is exposed in the MicroTx library runs the `begin()` method for XA transaction to start the XA transaction at the Teller microservice. This microservice also contains the business logic to issue the XA commit and roll back calls. This is a Helidon microservice.

The Teller service initiates, and then participates in the transaction, so it also requires a resource manager. Set up MySQL, a non-XA resource manager, for the Teller microservice.

# Set Up MySQL for Teller Service

MySQL is a JDBC resource which is not XA-compliant. Use Logging Last Resource (LLR) or Last Resource Commit (LRC) optimization to enable MySQL to participate in a distributed transaction as the data store for the Teller service, the transaction initiator service.

In this scenario, the transaction initiator and participant applications are Java applications. Use XA-compliant resource managers for Dept 1 and Dept 2 application. Set up MySQL as resource manager for the Teller application.

Set up a resource manager for the Teller application only when you want to try out the scenario where you use an initiator application as a participant as well. The banking teller application transfers an amount from one department to another. For every transaction, the teller application charges an amount as commission. Here, the teller application initiates the transaction and participates in it. A database instance must be attached to the teller application to save the transaction information.

To set up MySQL as a resource manager for the Teller application:

1.  Set up MySQL. For information about installation and configuration, refer to the MySQL documentation.
2.  Run the following sample commands to create a table in MySQL with seed data for the sample XA application. Use the `fee` table to demonstrate the commission charged by the Teller application.
    ```
    create database transfer_fee;
    use transfer_fee;
    create table fee
    (
        account_id VARCHAR(10) not null,
        amount decimal(10,2) not null,
        PRIMARY KEY (account_id)
    );
    insert into fee values('account1', 10.00);
    insert into fee values('account2', 20.00);
    insert into fee values('account3', 30.00);
    insert into fee values('account4', 40.00);
    insert into fee values('account5', 50.00);
    ```

3. Create a table for storing the committed records. Skip this step if you are running the sample app for Last Resource Commit (LRC) optimization.

    ```
    CREATE TABLE LLR_COMMIT_RECORD (
        GTRID varchar(255) NOT NULL,
        DATE_COMMITED TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        RECORDSTR text,
        PRIMARY KEY (GTRID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    ```
4. Enable session affinity or sticky sessions for the participant service. See [Enable Session Affinity for XA Participants](https://docs.oracle.com/en/database/oracle/transaction-manager-for-microservices/23.4.1/tmmdg/set-sample-applications.html#GUID-F3BE4A11-1C96-4608-A000-DAD504D61349).

5. Provide the details for the application to connect to the resource manager. If you want to run the application in the local enviroment, provide these details in the `application.yaml` file, which is located in the `../src/main/resources` folder of your application. If you want to run the application in Docker environment or Kubernetes cluster, provide these details in the `values.yaml` file, which is located in the `samples/xa/java/helmcharts/transfer-teller-as-participant-nonxa-ds` folder.

    * connectString or url: Enter the URL to access the database. For example, `jdbc:mysql://localhost:3306/transfer_fee`, where localhost is the name of the server hosting your database, 3306 is the port number, and `transfer_fee` is the name of the existing database to which you want to connect.
    * user name and password: provide the credentials required to access the database.

# Build the Teller Application Code on Local Machine

1. Compile the application code to generate an executable JAR file. Run the following commands in the `teller-as-participant-nonxa-ds` folder.

    ```
    cd samples/xa/java/teller-as-participant-nonxa-ds
    mvn clean package
    ```
    
    This creates an executable JAR file, `teller-as-participant-nonxa-ds.jar`, within the `target` folder.

2. Run the JAR file that was created.

    ```
    java -DfeeDataSource.url="<database_url>" -DfeeDataSource.user=<user> -jar target/teller-as-participant-nonxa-ds.jar
    ```

    Where, `<database_url>` refers to the URL to access the resource manager that you have set up for the application and `<user>` refers to the username to access the database. Provide these values based on your environment.

Next: Run the Bank Transfer application in the local environment. See [the readme of the Bank Transfer application](../../readme.md#run-the-bank-transfer-application-to-transfer-an-amount).

# Build Docker Image of the Teller Application in a Container-based Platform

The Transaction Manager for Microservices coordinator is a containerized application and can run on any container-based platforms, such as Docker and Kubernetes.

If you want to run the Bank Transfer application in a Kubernetes or Docker environment, use one of the following commands based on the environment in which you want to run the application.

*  Run the following commands to build the Docker image for the Teller application in a Kubernetes cluster.

    **Sample command**

    ```
    cd samples/xa/java/teller-as-participant-nonxa-ds
    docker image build -t teller:1.0 .
    ```
    The Docker image that you have created is available in your local Docker container registry. Note down the names of the image as you will provide this information later.

*   Run the following commands to build the Docker image for the Teller application in a Docker Swarm environment.
    
    **Sample command**
    ```
    cd samples/xa/java/teller-as-participant-nonxa-ds
    docker image build -t $REGISTRY_LOCATION/teller:1.0 .
    ```

    Where, `REGISTRY_LOCATION` is an environment variable that points to the location of the Docker registry.

Next: Push the Docker image of the microservices, that you have built, to a remote repository. In the `values.yaml` file, provide details of all the sample application images that you have uploaded to the docker container. See [the readme of the Bank Transfer application](../../readme.md).
