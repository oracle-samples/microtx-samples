Individual folders contains the Node.js code for each microservice of the Travel Agent application. The sample code is already integrated with the MicroTx client library files. For more information about the application, see [About the Travel Agent application](../readme.md).

Before running the Travel Agent application, ensure that you complete all the prerequsites and install Transaction Manager for Microservices. See [Prerequisites](../../README.md).

**Table of Contents**

<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->

- [Run the Travel Agent Application in the Local Environment](#run-the-travel-agent-application-in-the-local-environment)
    * [Customize the Ports](#customize-the-ports)
    * [Compile and Start the Microservices](#compile-and-start-the-microservices)
    * [Run the Travel Agent Application](#run-the-travel-agent-application)
- [Run the Travel Agent Application in Kubernetes](#run-the-travel-agent-application-in-kubernetes)
    * [Build Docker Images for the Travel Agent Application](#build-docker-images-for-the-travel-agent-application)
    * [Push the Docker Images](#push-the-docker-images)
    * [Update the `values.yaml` File](#update-the-valuesyaml-file)
    * [Install the Travel Agent Application](#install-the-travel-agent-application)
    * [Run the Travel Agent Application](#run-the-travel-agent-application-1)
- [Run the Travel Agent application in Docker Swarm](#run-the-travel-agent-application-in-docker-swarm)
    * [Build Docker Images for the Travel Agent Application](#build-docker-images-for-the-travel-agent-application-1)
    * [Install the Travel Agent application in Docker Swarm](#install-the-travel-agent-application-in-docker-swarm)
    * [Run the Travel Agent Application](#run-the-travel-agent-application-2)

<!-- TOC end -->

# Run the Travel Agent Application in the Local Environment

## Customize the Ports

(Optional.) The microservices are configured to run on specific ports. The Flight microservices runs on port 8083, Hotel microservices runs on port 8082, and the Travel Agent microservice runs on port 8085. The following sample commands show how you can run the microservices on a custom port. Provide a port number based on your environment.

**Sample commands**

```
cd /samples/tcc/nodejs/flight
npm_config_http_port=8083 npm run prod

cd /samples/tcc/nodejs/hotel
npm_config_http_port=8082 npm run prod

cd /samples/tcc/nodejs/travel-agent
npm_config_http_port=8085 npm run prod
```

## Compile and Start the Microservices

Compile the application code to install the package and all its dependencies, and then start the microservices.

* Run the following command to compile and start the Flight Booking microservice.

    ```
    cd /samples/tcc/nodejs/flight
    npm install
    npm run prod
    ```

* Run the following command to compile and start the Hotel Booking microservice.

    ```
    cd /samples/tcc/nodejs/hotel
    npm install
    npm run prod
    ```

* Run the following command to compile and start the Travel Agent microservice.

    ```
    cd /samples/tcc/nodejs/travel-agent
    npm install
    npm run prod
    ```

Ensure that all the microservices are running, before you proceed to the next step.

## Run the Travel Agent Application

When you run the Travel Agent application, it makes a provisional booking by reserving a hotel room and flight ticket.

Only when you provide approval to confirm the booking, the booking of the hotel room and flight ticket is confirmed. If you cancel the provisional booking, the provisional booking of the hotel room and flight ticket is canceled. The application includes the code for releasing the provisionally blocked hotel and flight and making these resources available in case of a cancellation.

To run the Travel Agent application in the local environment:

1. Run the following command to reserve a hotel and flight booking.

   **Sample Command**

    ```
    curl --header 'Accept: application/json' \
         -X POST \
         -d '' "https://localhost:8080/travel-agent/api/bookings/reserve?hotelName=Acme&flightNumber=AA2250"
    ```

   Where, `8080` is the port where the Travel Agent application is running.

   **Sample Response**
    ```
    {
        "tripBookingId": "840c7f0c-d87e-4694-aba5-0846e716ce99",
        "message": "Successfully booked the trip",
        "status": "RESERVED",
        "flightBooking": {
            "bookingId": "e32e1cbf-4d6d-431a-a5af-d48570e02666",
            "bookingUri": "http://localhost:8082/travel-agent/api/bookings/e32e1cbf-4d6d-431a-a5af-d48570e02666",
            "expires": 120000,
            "name": "AA2250",
            "startTime": 1677146471233,
            "type": "FLIGHT"
        },
        "hotelBooking": {
            "bookingId": "e140cdba-30a6-44c0-b7c2-c168f763641c",
            "bookingUri": "http://localhost:8081/travel-agent/api/bookings/e140cdba-30a6-44c0-b7c2-c168f763641c",
            "expires": 120000,
            "name": "Acme",
            "startTime": 1677146471209,
            "type": "HOTEL"
        }
    }
    ```

   This commands reserves a hotel and flight booking and the status is `RESERVED`.

2. Note down the values of `tripBookingId` and the `link` response header. You will need to provide this information in the next step.
3. You can choose to either confirm or cancel the reservation. Run one of the following commands to confirm or cancel the transaction.

    * To confirm a transaction, run the following command:

      **Command Syntax**

        ```
        curl --header 'Accept: application/json' \
             -X PUT
             -H "link: <linkID>"
             -d '' http://localhost:8080/travel-agent/api/confirm/tripBookingId
        ```

      **Sample Command**

        ```
        curl --header 'Accept: application/json' \
             -H "link: <http://localhost:9000/api/v1/tcc-transaction/4e6dc225-d8af-4988-8446-a70e4cbd1e44>; rel=\"https://otmm.oracle.com/tcc-transaction\"" \
             -X PUT \
             -d '' "https://localhost:8080/travel-agent/api/confirm/840c7f0c-d87e-4694-aba5-0846e716ce99"
        ```

    * To cancel a transaction, run the following command:

      **Command Syntax**

        ```
        curl --location \
             --header 'Accept: application/json' \
             -H "link: <linkID>"
             -X DELETE \
             -d '' https://localhost:8080/travel-agent/api/cancel/<tripBookingId>
        ```

      **Sample Command**

        ```
        curl --location \
             --header 'Accept: application/json' \
             -H "link: <http://localhost:9000/api/v1/tcc-transaction/4e6dc225-d8af-4988-8446-a70e4cbd1e44>; rel=\"https://otmm.oracle.com/tcc-transaction\""
             -X DELETE \
             -d '' "https://localhost:8080/travel-agent/api/cancel/840c7f0c-d87e-4694-aba5-0846e716ce99"
        ```

4. View the status and details of a single booking by provide its `tripBookingId`.

   **Command Syntax**

    ```
    curl --location \
         -X GET \
         "https://localhost:8080/travel-agent/api/bookings/<tripBookingId>"
    ```

   **Sample Command**

    ```
    curl --location \
         --header 'Accept: application/json' \
         -X GET \
         "https://localhost:8080/travel-agent/api/bookings/840c7f0c-d87e-4694-aba5-0846e716ce99"
    ```

5. Run the following command to view the status and details of all bookings.

   **Sample Command**

    ```
    curl --location \
         --header 'Accept: application/json' \
         -X GET \
         "https://localhost:8080/travel-agent/api/bookings"
    ```

# Run the Travel Agent Application in Kubernetes

## Build Docker Images for the Travel Agent Application

Run the following commands to build the sample code to create Docker image for each microservice in the Travel Agent application.

* Run the following command to build the flight microservice.

    ```
    cd samples/tcc/nodejs/flight
    docker image build -t flight:1.0 .
    ```

* Run the following command to build the hotel microservice.

    ```
    cd samples/tcc/nodejs/hotel
    docker image build -t hotel:1.0 .
    ```

* Run the following command to build the trip agent microservice.

    ```
    cd samples/tcc/nodejs/travel-agent
    docker image build -t travel-agent:1.0 .
    ```

The Docker images that you have created are available in your local Docker container registry. Note down the names of the Docker images that you have created as you will have to provide these names in the next step.

## Push the Docker Images

Push the Docker images of the microservices, that you have built, to a remote repository.

The container image that you have built is available in your local repository. You must push this image to a remote repository, so that you can access this image using Helm. Later, you will use Helm to install the Travel Agent application.

1. Provide credentials to log in to the remote private repository to which you want to push the image.

    ```
    docker login <repo>
    ```

   Provide the login credentials based on the Kubernetes platform that you are using.

2. Specify a unique tag for the image that you want to push to the remote Docker repository.

   **Syntax**

    ```
    docker tag local\_image\[:tag\] remote\_image\[:tag\]
    ```

   Where,

    * `local\_image\[:tag\]` is the tag with which the image is identified in your local repository. Provide the name of the Docker images in your local repository which you have noted down in the previous task.
    * `remote\_image\[:tag\]` is the tag with which you want to identify the image in the remote Docker repository.

   The following sample commands tag the images of the hotel, flight, and trip manager Node.js applications.

   **Sample Commands**

    ```
    docker tag hotel:1.0 <region-key>.ocir.io/otmmrepo/hotel:1.0
    docker tag flight:1.0 <region-key>.ocir.io/otmmrepo/flight:1.0
    docker tag travel:1.0 <region-key>.ocir.io/otmmrepo/travel-agent:1.0 
    ```

   Where, `<region-key>.ocir.io/otmmrepo` is the Oracle Cloud Infrastructure Registry to which you want to push the image file. If you are using other Kubernetes platforms, then provide the details based on your environment.

3. Push the Docker image from your local repository to the remote Docker repository.

   **Syntax**

    ```
    docker push remote\_image\[:tag\]
    ```

   **Sample commands**

   The the following sample commands push the tagged images of hotel, flight, and trip agent applications. Provide the names of the remote images based on the information that you have entered in the previous step.

    ```
    docker push <region-key>.ocir.io/otmmrepo/hotel:1.0
    docker push <region-key>.ocir.io/otmmrepo/travel-agent:1.0
    docker push <region-key>.ocir.io/otmmrepo/flight:1.0
    ```

Note down the tag of the Docker image in the remote Docker repository. You'll need to enter this tag while pulling the image from the remote Docker repository.

## Update the `values.yaml` File

The sample application folder also contain the `values.yaml` file, the manifest file of the Travel Agent application, which contains the deployment configuration details for the Travel Agent application.

When you use Helm to deploy the application to a Kubernetes cluster, Helm pulls the Travel Agent application images from the remote Docker registry based on the details provided in the `values.yaml` file. Update the `values.yaml` file to specify the names of the Docker images.

To update the names of the Docker images that you have pushed to the remote repository in the `values.yaml` file:

1. Open the `values.yaml` file in any code editor. This file contains sample values. This file is located in the `helmcharts/sampleappstccnode` folder.

2. Provide details of all the sample application images that you have uploaded to the remote Docker repository. For example, `iad.ocir.io/mytenancy/tcc/flight-tcc:v1`.

3. Save your changes.

## Install the Travel Agent Application

Install the Travel Agent application in the Kubernetes cluster, where you have installed MicroTx.

1. Run the following commands to install the Travel Agent application. Where sample-tcc-app is the name of the application that is installed.

    ```
    cd otmm/samples/tcc/nodejs/helmcharts
            
    helm install sample-tcc-app --namespace otmm sampleappstccnode/ --values sampleappstccnode/values.yaml
    ```

2. Verify that all resources, such as pods and services, are ready. Use the following command to retrieve the list of resources in the namespace `otmm` and their status.

    ```
    kubectl get all -n otmm
    ```

3. Verify that the application is installed.

    ```
    helm list --namespace otmm
    ```

## Run the Travel Agent Application

When you run the Travel Agent application, it makes a provisional booking by reserving a hotel room and flight ticket.

Only when you provide approval to confirm the booking, the booking of the hotel room and flight ticket is confirmed. If you cancel the provisional booking, the provisional booking of the hotel room and flight ticket is canceled. The application includes the code for releasing the provisionally blocked hotel and flight and making these resources available in case of a cancellation.

Before you start a transaction, you must create an access token, install the MicroTx library files, and note down the external IP address of the Istio ingress gateway.

To run the Travel Agent application:

1. Run the following command to reserve a hotel room and a flight seat.

   **Sample Command**

    ```
    curl -H "Authorization:Bearer $TOKEN" \
         --header 'Accept: application/json' \
         -X POST \
         -d '' "https://$CLUSTER_IPADDR/travel-agent/api/bookings/reserve?hotelName=Acme&flightNumber=AA2250"
    ```

   Where,

    * `CLUSTER_IPADDR` is the name of the variable in which you stored the external IP address of the Istio ingress gateway.
    * `TOKEN` is the name of the variable in which you stored the authentication token earlier.

   **Sample Response**
    ```
    {
        "tripBookingId": "840c7f0c-d87e-4694-aba5-0846e716ce99",
        "message": "Successfully booked the trip",
        "status": "RESERVED",
        "flightBooking": {
            "bookingId": "e32e1cbf-4d6d-431a-a5af-d48570e02666",
            "bookingUri": "http://$CLUSTER_IPADDR/travel-agent/api/bookings/e32e1cbf-4d6d-431a-a5af-d48570e02666",
            "expires": 120000,
            "name": "AA2250",
            "startTime": 1677146471233,
            "type": "FLIGHT"
        },
        "hotelBooking": {
            "bookingId": "e140cdba-30a6-44c0-b7c2-c168f763641c",
            "bookingUri": "http://$CLUSTER_IPADDR/travel-agent/api/bookings/e140cdba-30a6-44c0-b7c2-c168f763641c",
            "expires": 120000,
            "name": "Acme",
            "startTime": 1677146471209,
            "type": "HOTEL"
        }
    }
    ```

   This commands reserves a hotel and flight booking and the status is `RESERVED`.

2. Note down the values of `tripBookingId` and the `link` response header. You will need to provide this information in the next step.
3. You can choose to either confirm or cancel the reservation. Run one of the following commands to confirm or cancel the transaction.

    * To confirm a transaction, run the following command:

      **Command Syntax**

       ```
       curl --header 'Accept: application/json' \
            -X PUT
            -H "link: <linkID>"
            -H "Authorization:Bearer $TOKEN" \
            -d '' http://$CLUSTER_IPADDR/travel-agent/api/confirm/tripBookingId
       ```

      **Sample Command**

       ```
       curl -H "Authorization:Bearer $TOKEN" \
            --header 'Accept: application/json' \
            -H "link: <http://192.0.4.1:9000/api/v1/tcc-transaction/4e6dc225-d8af-4988-8446-a70e4cbd1e44>; rel=\"https://otmm.oracle.com/tcc-transaction\"" \
            -X PUT \
            -d '' "https://$CLUSTER_IPADDR/travel-agent/api/confirm/840c7f0c-d87e-4694-aba5-0846e716ce99"
       ```

    * To cancel a transaction, run the following command:

      **Command Syntax**

        ```
        curl --location \
             --header 'Accept: application/json' \
             -H "link: <linkID>"
             -X DELETE \
             -H "Authorization:Bearer $TOKEN" \
             -d '' https://external-IP-address-Istio-ingress-gateway/travel-agent/api/cancel/tripBookingId
        ```

      **Sample Command**

        ```
        curl -H "Authorization:Bearer $TOKEN" \
             --location \
             --header 'Accept: application/json' \
             -H "link: <http://192.0.4.1:9000/api/v1/tcc-transaction/4e6dc225-d8af-4988-8446-a70e4cbd1e44>; rel=\"https://otmm.oracle.com/tcc-transaction\""
             -X DELETE \
             -d '' "https://$CLUSTER_IPADDR/travel-agent/api/cancel/840c7f0c-d87e-4694-aba5-0846e716ce99"
        ```

4. View the status and details of a single booking by provide its `tripBookingId`.

   **Command Syntax**

    ```
    curl --location \
         -X GET \
         -H "Authorization:Bearer $TOKEN" \
         "https://external-IP-address-Istio-ingress-gateway/travel-agent/api/bookings/tripBookingId"
    ```

   **Sample Command**

    ```
    curl -H "Authorization:Bearer $TOKEN" \
         --location \
         --header 'Accept: application/json' \
         -X GET \
         "https://$CLUSTER_IPADDR/travel-agent/api/bookings/840c7f0c-d87e-4694-aba5-0846e716ce99"
    ```

5. Run the following command to view the status and details of all bookings.

   **Command Syntax**

    ```
    curl --location \
         -X GET \
         -H "Authorization:Bearer $TOKEN" \
        "https://external-IP-address-Istio-ingress-gateway/travel-agent/api/bookings"
    ```

   **Sample Command**

    ```
    curl -H "Authorization:Bearer $TOKEN" \
         --location \
         --header 'Accept: application/json' \
         -X GET \
         "https://$CLUSTER_IPADDR/travel-agent/api/bookings"
    ```

# Run the Travel Agent application in Docker Swarm

## Build Docker Images for the Travel Agent Application

1. Store the location of the Docker registry in an environment variable named `REGISTRY_LOCATION` as shown in the following command.

    ```
    export REGISTRY_LOCATION=192.0.2.1:5000
    ```

   Where,

    * `192.0.2.1` is the IP address of the Docker registry that you have created.
    * `5000` is the port number over which the Docker registry container communicates. Ensure that you have set up the required networking rules to permit inbound and outbound HTTPS or HTTP traffic over this port.

   Note that, if you don't do this, then you must explicitly specify the IP address in the commands when required.

2. Run the following commands to build the sample code to create Docker image for each microservice in the Travel Agent application.

    * Run the following command to build the flight application.

      ```
      cd samples/tcc/nodejs/flight
      docker image build -t $REGISTRY_LOCATION/flight:1.0 .
      ```

    * Run the following command to build the hotel application.

      ```
      cd samples/tcc/nodejs/hotel
      docker image build -t $REGISTRY_LOCATION/hotel:1.0 .
      ```

    * Run the following command to build the travel agent application.

      ```
      cd samples/tcc/nodejs/travel-agent
      docker image build -t $REGISTRY_LOCATION/travel-agent:1.0 .
      ```

3. Push the tagged Docker image to the Docker registry that you have created.

   When you build the Docker images, they are available in your local Docker container registry. When you push the Docker image, it becomes available in the docker registry that you have created for the swarm.

   **Syntax**

    ```
    docker push image\[:tag\]
    ```
   **Sample commands**

   The following sample commands tag the images of the hotel, flight, and travel aganet Node.js applications.

    ```
    docker push $REGISTRY_LOCATION/hotel:1.0
    docker push $REGISTRY_LOCATION/flight:1.0
    docker push $REGISTRY_LOCATION/travel-agent:1.0
    ```

Note down the names of the Docker images that you have created as you will have to update the names of the images in the YAML file in the next step.

## Install the Travel Agent application in Docker Swarm

All Swarm objects are described in manifests called stack files. The `tmm-stack-compose.yaml` stack file is located at `installation_directory/otmm-<version>/samples/docker`. This YAML file describes all the components and configurations of the Travel Agent application and the transaction coordinator. Use this file to run and manage the microservices in Docker Swarm.

To install the Travel Agent application:

1. Provide details of all the sample application images that you have uploaded to the remote Docker repository. For example, `$REGISTRY_LOCATION/travel-agent:1.0`.
2. Save your changes.
3. Deploy the `tmm-stack-compose.yaml` stack file.

    ```
    cd installation_directory/otmm-<version>/samples/docker
    docker stack deploy -c tmm-stack-compose.yaml tmmtccdemo
    ```

   Where, `tmmtccdemo` is the name of the Docker stack that you want to install. You can specify any other name.

4. Verify that all services are ready. Use the following command to retrieve the list of services and their status.

    ```
    docker service ls
    ```

When the services are ready, you can run a transaction.

## Run the Travel Agent Application

When you run the the Travel Agent application, it makes a provisional booking by reserving a hotel room and flight ticket.

Only when you provide approval to confirm the booking, the booking of the hotel room and flight ticket is confirmed. If you cancel the provisional booking, the provisional booking of the hotel room and flight ticket is canceled. Your application must include the code for releasing the provisionally blocked hotel and flight and making these resources available in case of a cancellation.

1. Run the following command to reserve a hotel and flight booking.

   **Sample Command**

    ```
    curl -H "Authorization:Bearer $TOKEN" \
         --header 'Accept: application/json' \
         -X POST \
         -d '' "https://$REGISTRY_LOCATION/travel-agent/api/bookings/reserve?hotelName=Acme&flightNumber=AA2250"
    ```

   Where,

    * `REGISTRY_LOCATION` is the name of the variable in which you stored the location of the Docker registry.
    * `TOKEN` is the name of the variable in which you stored the authentication token earlier.

   **Sample Response**

    ```
        {
            "tripBookingId": "840c7f0c-d87e-4694-aba5-0846e716ce99",
            "message": "Successfully booked the trip",
            "status": "RESERVED",
            "flightBooking": {
                "bookingId": "e32e1cbf-4d6d-431a-a5af-d48570e02666",
                "bookingUri": "http://$REGISTRY_LOCATION/travel-agent/api/bookings/e32e1cbf-4d6d-431a-a5af-d48570e02666",
                "expires": 120000,
                "name": "AA2250",
                "startTime": 1677146471233,
                "type": "FLIGHT"
            },
            "hotelBooking": {
                "bookingId": "e140cdba-30a6-44c0-b7c2-c168f763641c",
                "bookingUri": "http://$REGISTRY_LOCATION/travel-agent/api/bookings/e140cdba-30a6-44c0-b7c2-c168f763641c",
                "expires": 120000,
                "name": "Acme",
                "startTime": 1677146471209,
                "type": "HOTEL"
            }
        }
    ```

   This commands reserves a hotel and flight booking and the status is `RESERVED`.

2. Note down the values of `tripBookingId` and the `link` response header. You will need to provide this information in the next step.
3. You can choose to either confirm or cancel the reservation. Run one of the following commands to confirm or cancel the transaction.

    * To confirm a transaction, run the following command:

      **Command Syntax**
        ```
        curl --location 
             -X PUT 
             -H "Authorization:Bearer $TOKEN" \
             -H "link: <linkID>"\
             -d '' "http://$REGISTRY_LOCATION/travel-agent/api/confirm/tripBookingId"
        ```

      **Sample Command**

        ```
        curl -H "Authorization:Bearer $TOKEN" \
             --header 'Accept: application/json' \
             -H "link: <http://192.0.4.1:9000/api/v1/tcc-transaction/4e6dc225-d8af-4988-8446-a70e4cbd1e44>; rel=\"https://otmm.oracle.com/tcc-transaction\""
             -X PUT \
             -d '' "https://$REGISTRY_LOCATION/travel-agent/api/confirm/840c7f0c-d87e-4694-aba5-0846e716ce99"
        ```

    * To cancel a transaction, run the following command:

      **Command Syntax**

        ```
        curl --location 
             -X DELETE \
             -H "Authorization:Bearer $TOKEN" \
             -H "link: <linkID>"\
             -d '' https://REGISTRY_LOCATION/travel-agent/api/cancel/tripBookingId
        ```

      **Sample Command**

        ```
        curl -H "Authorization:Bearer $TOKEN" \
             --location \
             --header 'Accept: application/json' \
             - H "link: <http://192.0.4.1:9000/api/v1/tcc-transaction/4e6dc225-d8af-4988-8446-a70e4cbd1e44>; rel=\"https://otmm.oracle.com/tcc-transaction\""
             -X DELETE \
             -d '' "https://$REGISTRY_LOCATION/travel-agent/api/cancel/840c7f0c-d87e-4694-aba5-0846e716ce99"
        ```

4. View the status and details of a single booking by provide its `tripBookingId`.

   **Command Syntax**

    ```
    curl --location 
         -X GET 
         -H "Authorization:Bearer $TOKEN" \
         "https://REGISTRY_LOCATION/travel-agent/api/bookings/tripBookingId"
    ```

   **Sample Command**

    ```
    curl -H "Authorization:Bearer $TOKEN" \
         --location \
         --header 'Accept: application/json' \
         -X GET \
         "https://$REGISTRY_LOCATION/travel-agent/api/bookings/840c7f0c-d87e-4694-aba5-0846e716ce99"
    ```

5. Run the following command to view the status and details of all bookings.

   **Sample Command**

    ```
    curl -H "Authorization:Bearer $TOKEN" \
         --location \
         --header 'Accept: application/json' \
         -X GET \
         "https://$REGISTRY_LOCATION/travel-agent/api/bookings"
    ```