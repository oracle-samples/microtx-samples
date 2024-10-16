# About the Teller Microservice

When you run the Bank Transfer application, the Teller microservice initiates the transactions so it is called a transaction initiator service. The user interacts with this microservice to transfer money between Departments One and Two. When a new request is created, the helper method that is exposed in the MicroTx library runs the `begin()` method for XA transaction to start the XA transaction at the Teller microservice. This microservice also contains the business logic to issue the XA commit and roll back calls. This is a Spring Boot microservice.

The Teller service initiates, and then participates in the transaction, so it also requires a resource manager. Set up a XA-compliant resource manager for the Teller microservice. See [the readme of the Bank Transfer application](../../readme.md).

## Build Docker Image of the Teller Application

*  Run the following commands to build the Docker image for the Teller application in a Kubernetes cluster.

    **Sample command**

    ```
    cd samples/xa/java/teller-spring-openfeign
    docker image build -t teller:1.0 .
    ```
    The Docker images that you have created are available in your local Docker container registry. Note down the names of the images as you will provide this information later.

*   Run the following commands to build the Docker image for the Teller application in the Docker Swarm environment.
    
    **Sample command**
    ```
    cd samples/xa/java/teller-spring-openfeign
    docker image build -t $REGISTRY_LOCATION/teller:1.0 .
    ```

    Where, `REGISTRY_LOCATION` is an environment variable that points to the location of the Docker registry.

Next: Push the Docker image of the microservices, that you have built, to a remote repository. In the `values.yaml` file, provide details of all the sample application images that you have uploaded to the docker container. See [the readme of the Bank Transfer application.](../../readme.md).