# About the Trip Booking Application

The Trip Booking application contains several microservices that interact with each other to complete a transaction. Run this application to book a trip, which consists of booking a hotel room and a flight. Each microservice in the Trip Booking application performs a different task. One microservice books a trip, another books a flight, and a third microservice books a hotel. MicroTx coordinates the transactions between these microservices.

Eclipse Microprofile provides the annotations and APIs to coordinate LRA transactions for JAX-RS based REST applications. See https://download.eclipse.org/microprofile/microprofile-lra-1.0-M1/microprofile-lra-spec.html#introduction. Helidon provides the implementation for LRA client specifications. For information, see https://helidon.io/docs/v2/#/mp/lra/01_introduction.

The Trip Booking application demonstrates the functionality provided by Eclipse MicroProfile Long Running Actions (LRA) and MicroTx to coordinate the transactions. The services communicate with each other through the exposed REST endpoints while using the MicroTx libraries. Let's use this application to understand how microservices and MicroTx interact with each other in a transaction that uses the LRA transaction protocol.

The following figure shows the various microservices that are available in the Trip Booking application.

![Microservices in the Trip Booking application](graphics/lra_sample_app.png)

The Trip Booking application consists of the following polyglot microservices:

*   MicroTx (LRA Coordinator) coordinates the transaction between the microservices.
*   Trip Manager service is the transaction initiator service, where the LRA transaction starts. This Java application is located at `samples/lra/lrademo/trip-manager`. While booking a trip, this service calls the flight and hotel services for booking a flight and hotel respectively. The Trip Manager exposes the following APIs to book both the hotel and flight and to cancel the booking.
    *  POST call on the `/trip` endpoint starts an LRA due to the `@LRA` annotation on the `bookTrip` method and registers the service with the LRA coordinator.
    *  The `bookTrip` method calls the Hotel Booking service to make a hotel room reservation.
    *  The `bookTrip` method also calls the Flight Booking service to make a flight reservation.
    *  After the `bookTrip` method is executed, the LRA client automatically call close or cancel on the LRA based on the results of the above bookings. Since the LRA is defined as `end=true` (default), either both hotel and flight are booked successfully or both bookings are canceled if there is a failure.
*   Hotel Booking service exposes APIs to book a hotel room and also to cancel the booking in case of any failure. It is called by the Trip Manager service to reserve a room. The Trip Manager service calls the `bookRoom` method, provided by the Hotel Booking service. This call is executed within the context of an existing LRA and propagated by the Trip Manager service as the `@LRA` value is `Mandatory`. The Hotel Booking service enlists itself with the MicroTx LRA coordinator and provides callback URIs that the LRA coordinator uses to complete or compensate the room reservation. This Java application is located at `samples/lra/lrademo/hotel`.
*   Flight Booking service exposes APIs to book a flight ticket and also to cancel the booking in case of any failure. The Trip Manager service calls the `/flight` endpoint, exposed by the Flight Booking service, to book a flight ticket. This call is executed within the context of an existing LRA and propagated by the Trip Manager service as the `@LRA` value is `Mandatory`. The Flight Booking service enlists itself and provides callback URIs that the LRA coordinator uses to complete or compensate the flight reservation. This TypeScript application is located at `samples/lra/lrademo/flight`.
*   Trip client is the user interface which you can use to confirm or cancel the booking. It does not participate in the LRA transaction. It is provided as sample client service which calls microservices to perform a distributed transaction that uses the LRA protocol. This Java application is located at `samples/lra/lrademo/trip-client`.

When you run the application, it makes a provisional booking by reserving a hotel room and flight ticket. Only when you provide approval to confirm the reservation, the booking of the hotel room and flight ticket is confirmed. If you cancel the provisional booking, the hotel room and flight ticket that was blocked is released and the booking is canceled. By default, the flight service permits only two confirmed bookings. To enable you to test the failure scenario, the flight service rejects any additional booking requests that are made after two confirmed bookings. This leads to the cancellation (compensation) of a provisionally booked hotel within the trip and the trip is not booked.Trip Booking application

Individual folders contain source code for the microservices, YAML file to provide configuration information, and Helm chart to deploy the Travel Agent application.

## Prerequisites

Set up a Kubernetes cluster or Docker Swarm environment, and install MicroTx in this environment.

# Run Trip Booking Application in your Local Environment

## Build Docker Images for Trip Booking Application

Perform the following steps to build Docker images for each microservice in the Trip Booking application:

1.  Build the Hotel Booking service, Flight Booking service, and Trip Manager services.

    ```
    cd samples/lra/lrademo
    sh build.sh
    ```
2. Deploy the Hotel Booking service, Flight Booking service, and Trip Manager services in a Kubernetes cluster.

   ```
   kubectl apply -f deployment.yaml
   ```

## Run the Trip Booking Application

Run the Trip Booking application to book a hotel room and flight ticket. When you run the application, it makes a provisional booking by reserving a hotel room and flight ticket. Only when you provide approval to confirm the booking, the booking of the hotel room and flight ticket is confirmed. If you cancel the provisional booking, the hotel room and flight ticket that was blocked is released and the booking is canceled. By default, the flight service permits only two confirmed bookings. To enable you to test the failure scenario, the flight service sample application rejects any additional booking requests that are made after two confirmed bookings. This leads to the cancellation (compensation) of a provisionally booked hotel within the trip and the trip is not booked.

1.  Run the following command to make a provisional booking by reserving a hotel room and flight ticket.
    
    **Command Syntax**

    ```
    curl -X POST \
         -d '' http://trip-manager:8080/trip-service/api/trip?hotelName=Mercury&flightNumber=A123
    ```

    **Sample Response**

    ```
        {
          "cancelPending": false,
          "details": [
            {
              "cancelPending": false,
              "details": [
                
              ],
              "encodedId": "http%3A%2F%2Fomtm-tcs%3A9000%2Fapi%2Fv1%2Flra-coordinator%2F011899ca-20f3-4d8c-9e92-76de355921fe",
              "id": "http://otmm-tcs:9000/api/v1/lra-coordinator/011899ca-20f3-4d8c-9e92-76de355921fe",
              "name": "Mercury",
              "status": "PROVISIONAL",
              "type": "Hotel"
            },
            {
              "cancelPending": false,
              "details": [
                
              ],
             "encodedId": "http%3A%2F%2Fomtm-tcs%3A9000%2Fapi%2Fv1%2Flra-coordinator%2F011899ca-20f3-4d8c-9e92-76de355921fe",
              "id": "http://otmm-tcs:9000/api/v1/lra-coordinator/011899ca-20f3-4d8c-9e92-76de355921fe",
              "name": "A123",
              "status": "PROVISIONAL",
              "type": "Flight"
            }
          ],
          "encodedId": "http%3A%2F%2Fomtm-tcs%3A9000%2Fapi%2Fv1%2Flra-coordinator%2F011899ca-20f3-4d8c-9e92-76de355921fe",
          "id": "http://otmm-tcs:9000/api/v1/lra-coordinator/011899ca-20f3-4d8c-9e92-76de355921fe",
          "name": "Aggregate Booking",
          "status": "PROVISIONAL",
          "type": "Trip"
        }
    ```

2.  Note down the value of the `encodedId` and `id`. You will need to provide this information in the next step.

3.  Run one of the following commands to confirm or cancel the transaction.

    *  Run the following command to confirm the transaction.
    
       **Command Syntax**

       ```
       curl --location \
            -H "Long-Running-Action: LRA-ID" \
            --request PUT \
            -d '' http://trip-manager:8080/trip-service/api/trip/url-encoded-LRA-ID
       ```

       Where, `LRA-ID` is the value of the `id` attribute and `url-encoded-LRA-ID` is the value of the `encodedId` attribute that you have noted down.
    
       **Sample Command**

       ```
       curl --location \
            -H "Long-Running-Action: http://otmm-tcs:9000/lra-coordinator/011899ca-20f3-4d8c-9e92-76de355922fe" \
            --request PUT \
            -d '' "http://trip-manager:8080/trip-service/api/trip/ http%3A%2F%2Fotmm-tcs%3A9000%2Flra-coordinator%2F011899ca-20f3-4d8c-9e92-76de355921fe"
       ```
    
    *  Run the following command to cancel the transaction.

       **Command Syntax**

       ```
       curl --location \
            -H "Long-Running-Action: LRA-ID" \
            --request DELETE \
            -d '' http://trip-manager:8080/trip-service/api/trip/url-encoded-LRA-ID
       ```

       Where, `LRA-ID` is the value of the `id` attribute and `url-encoded-LRA-ID` is the value of the `encodedId` attribute that you have noted down.
    
       **Sample Command**

       ```
       curl --location \
            -H "Long-Running-Action: http://otmm-tcs:9000/lra-coordinator/011899ca-20f3-4d8c-9e92-76de355922fe" \
            --request DELETE \
            -d '' "http://trip-manager:8080/trip-service/api/trip/ http%3A%2F%2Fotmm-tcs%3A9000%2Flra-coordinator%2F011899ca-20f3-4d8c-9e92-76de355921fe"
       ```
      

4.  Run the following commands to see the status of the booking.
    
    ```
    curl -X GET -H  https://hotel:8080/hotelService/api/hotel | jq
    curl -X GET -H  https://flight:8080/flightService/api/flight | jq
    ```

5.  Run the application again to try out the failure scenario and to understand how the MicroTx coordinator performs the compensation. To enable you to test the failure scenario, the maximum number of available bookings for hotel is set at 3 and flight is set at 2. The flight service sample application rejects any additional booking requests that are made after two confirmed bookings. The third trip booking fails as only 2 flight seats are available. This leads to the cancellation (compensation) of a provisionally booked hotel within the trip and the trip is not booked. Since hotel is booked before flight, the MicroTx coordinator calls the Hotel Booking service to compensate the booking.

6. (Optional.) To change the maximum number of available bookings for hotel and flight, run the following commands:
    ```
    curl --location --request PUT 'http://hotel:8080/hotelService/api/maxbookings?count=7'
    curl --location --request PUT 'http://flight:8080/flightService/api/maxbookings?count=7'
    ```

# Run Trip Booking Application in Kubernetes

## Build Docker Images for Trip Booking Application

Perform the following steps to build Docker images for each microservice in the Trip Booking application:

1.  Run the following commands to build the Docker image for the Hotel Booking service.

    ```
    cd samples/lra/lrademo/hotel
    docker image build -t hotel:1.0 .
    ```
    
    When the image is successfully built, the following message is displayed.
    Successfully tagged hotel:1.0

2.  Run the following commands to build the Docker image for the Flight Booking service.

    ```
    cd samples/lra/lrademo/flight
    docker image build -t flight:1.0 .
    ```

    When the image is successfully built, the following message is displayed.
    Successfully tagged flight:1.0

3.  Run the following commands to build the Docker image for the Trip Manager application.

    ```
    cd samples/lra/lrademo/trip-manager
    docker image build -t trip-manager:1.0 .
    ```
    
    When the image is successfully built, the following message is displayed.
    
    Successfully tagged trip-manager:1.0
    
The Docker images that you have created are available in your local Docker container registry.

## Push LRA Sample App Images

Push the Docker image of all microservices in the Trip Booking application, that you have built, to a remote repository.

The container image that you have built is available in your local repository. You must push this image to a remote repository, so that you can access this image using Helm. Later, you will use Helm to install the Trip Booking application.

1.  In a terminal window on the client machine running Docker, log in to Oracle Cloud Infrastructure Registry, to which you want to push the image, by entering:

    ```
    docker login <region-key>.ocir.io
    ```

    Where `<region-key>` is the key for the Oracle Cloud Infrastructure Registry region you're using. For example, `phx`.
    
2.  Use the following command to specify a unique tag for the image that you want to push to the remote Docker repository.
    
    **Syntax**

    ```
    docker tag local\_image\[:tag\] remote\_image\[:tag\]
    ```

    Where,
    
    *   `local\_image\[:tag\]` is the tag with which the image is identified in your local repository.
    *   `remote\_image\[:tag\]` is the tag with which you want to identify the image in the remote Docker repository.
    
    **Sample commands**
    
    The following sample commands tag the images of Hotel Booking, Flight Booking, and Trip Manager applications.

    ```
    docker tag hotel:1.0 <region-key>.ocir.io/otmmrepo/hotel:1.0
    docker tag trip-manager:1.0 <region-key>.ocir.io/otmmrepo/trip-manager:1.0 
    docker tag flight:1.0 <region-key>.ocir.io/otmmrepo/flight:1.0
    ```

    Where, `<region-key>.ocir.io/otmmrepo` is the Oracle Cloud Infrastructure Registry to which you want to push the image file. If you are using other Kubernetes platforms, then provide the details based on your environment.
    
3.  Push the Docker image from your local repository to the remote Docker repository.
    
    **Syntax**

    ```
    docker push remote\_image\[:tag\]
    ```
    
    **Sample commands**
    
    The the following sample commands push the tagged images of Hotel Booking, Flight Booking, and Trip Manager applications.

    ```
    docker push <region-key>.ocir.io/otmmrepo/hotel:1.0
    docker push <region-key>.ocir.io/otmmrepo/trip-manager:1.0
    docker push <region-key>.ocir.io/otmmrepo/flight:1.0
    ```

Note down the tag of the Docker image in the remote Docker repository. You'll need to enter this tag while pulling the image from the remote Docker repository.

## Update the values.yaml File

The sample application files also contain the `values.yaml` file, the manifest file of the sample application, which contains the deployment configuration details for the Trip Booking applicationlication.

While deploying the Trip Booking application to a Kubernetes cluster, Helm pulls the sample application images from the remote Docker registry. In the `values.yaml` file, specify the image to pull and the credentials to use when pulling the images.

To provide configuration and environment details in the `values.yaml` file:

1.  Open the `values.yaml` file, which is located at `samples/lra/helmcharts/sampleappslra/values.yaml`, in any code editor. This file contains sample values.
2.  Provide details of all the images that you have uploaded to the docker container. For example, `iad.ocir.io/mytenancy/lra/trip-manager-lra:v1`.
3.  Save your changes.

## Install the Trip Booking application

Install the Trip Booking application in the Kubernetes cluster where you have installed MicroTx.

1.  Run the following commands to install the Trip Booking application.

    ```
    cd samples/lra/helmcharts
    helm install sample-lra-app --namespace otmm sampleappslra/ --values sampleappslra/values.yaml
    ```

    Where, `sample-lra-app` is the name of the application that is installed.
    
    The following output is displayed.
    ```
        NAME: sample-lra-app
        LAST DEPLOYED: Wed Apr 20 17:12:32 2022
        NAMESPACE: otmm
        STATUS: deployed
        REVISION: 1
        TEST SUITE: None
    ```
    
2.  Verify that all resources, such as pods and services, are ready. Use the following command to retrieve the list of resources in the namespace `otmm` and their status.

    ```
    kubectl get all -n otmm
    ```
    
    The following sample output shows that all the pods are ready and in the `Running` state.

    ```
        NAME                                READY   STATUS    RESTARTS      AGE
        pod/flight-95db44488-h4br8          2/2     Running   0             17h
        pod/hotel-75bd8c59cb-hxgj5          2/2     Running   0             17h
        pod/otmm-tcs-84b87b66bd-9mntz       2/2     Running   1 (20h ago)   37h
        pod/trip-manager-6df68db55b-sdhcg   2/2     Running   0             17h
        
        NAME                   TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
        service/flight         ClusterIP   10.100........   <none>        8080/TCP   17h
        service/hotel          ClusterIP   10.101........   <none>        8080/TCP   17h
        service/otmm-tcs       ClusterIP   10.109........   <none>        9000/TCP   37h
        service/trip-manager   ClusterIP   10.97.........   <none>        8080/TCP   17h
        
        NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
        deployment.apps/flight         1/1     1            1           17h
        deployment.apps/hotel          1/1     1            1           17h
        deployment.apps/otmm-tcs       1/1     1            1           37h
        deployment.apps/trip-manager   1/1     1            1           17h
        
        NAME                                      DESIRED   CURRENT   READY   AGE
        replicaset.apps/flight-95db44488          1         1         1       17h
        replicaset.apps/hotel-75bd8c59cb          1         1         1       17h
        replicaset.apps/otmm-tcs-84b87b66bd       1         1         1       37h
        replicaset.apps/trip-manager-6df68db55b   1         1         1       17h
    ```

3.  Verify that the application is installed.

    ```
        helm list --namespace otmm
    ```

    The following sample output displays details of the applications installed in the `otmm` namespace. Where, `sample-lra-app` is the Trip Booking application that you have installed.

    ```
    NAME            NAMESPACE   REVISION   UPDATED                                 STATUS     CHART                   APP VERSION
    otmm            otmm        1          2022-04-19 21:14:25.1941414 +0530 IST   deployed   otmm-RELEASE            RELEASE
    sample-lra-app  otmm        1          2022-04-20 17:12:32.8553506 +0530 IST   deployed   sampleappslra-1.0.1     1.0.1
    ```

## Run the Trip Booking Application

Run the Trip Booking application to book a hotel room and flight ticket. Before you run the application, you must create an access token, install the MicroTx library files, and note down the external IP address of the Istio ingress gateway.

1.  Run the following command to book a hotel and flight.
    
    **Command Syntax**

    ```
    curl -H "Authorization:Bearer $TOKEN" \
         -X POST \
         -d '' external-IP-address-Istio-ingress-gateway:Istio port number/application-specific-URI-for-transaction
    ```
    
    **Sample Command**

    ```
    curl -H "Authorization:Bearer $TOKEN" \
         -X POST \
         -d '' "https://192.0.2.1:443/trip-service/api/trip?hotelName=Mercury&flightNumber=A123" | jq
    ```

    Where,
    
    *   `192.0.2.1` is the external IP address of the Istio ingress gateway.
    *   `443` is the Istio port number.
    *   `TOKEN` is the name of the variable in which you stored the authentication token earlier. For information about retrieving the authentication token and storing it in a variable.
    
    **Sample Response**

    ```
        {
          "cancelPending": false,
          "details": [
            {
              "cancelPending": false,
              "details": [
                
              ],
              "encodedId": "http%3A%2F%2Fomtm-tcs%3A9000%2Fapi%2Fv1%2Flra-coordinator%2F011899ca-20f3-4d8c-9e92-76de355921fe",
              "id": "http://otmm-tcs:9000/api/v1/lra-coordinator/011899ca-20f3-4d8c-9e92-76de355921fe",
              "name": "Mercury",
              "status": "PROVISIONAL",
              "type": "Hotel"
            },
            {
              "cancelPending": false,
              "details": [
                
              ],
             "encodedId": "http%3A%2F%2Fomtm-tcs%3A9000%2Fapi%2Fv1%2Flra-coordinator%2F011899ca-20f3-4d8c-9e92-76de355921fe",
              "id": "http://otmm-tcs:9000/api/v1/lra-coordinator/011899ca-20f3-4d8c-9e92-76de355921fe",
              "name": "A123",
              "status": "PROVISIONAL",
              "type": "Flight"
            }
          ],
          "encodedId": "http%3A%2F%2Fomtm-tcs%3A9000%2Fapi%2Fv1%2Flra-coordinator%2F011899ca-20f3-4d8c-9e92-76de355921fe",
          "id": "http://otmm-tcs:9000/api/v1/lra-coordinator/011899ca-20f3-4d8c-9e92-76de355921fe",
          "name": "Aggregate Booking",
          "status": "PROVISIONAL",
          "type": "Trip"
        }
    ```

2.  Note down the value of the `encodedId` and `id`. You will need to provide this information in the next step.

3.  Run one of the following commands to confirm or cancel the transaction.

    *  Run the following command to confirm the transaction.
    
       **Command Syntax**

       ```
       curl --location \
         -H "Authorization:Bearer $TOKEN" \
         -H "Long-Running-Action: LRA-ID" \
         --request PUT \
         -d '' http://external-ip-Istio-ingress-gateway/trip-service/api/trip/url-encoded-LRA-ID
       ```

       Where, `LRA-ID` is the value of the `id` attribute and `url-encoded-LRA-ID` is the value of the `encodedId` attribute that you have noted down.
    
       **Sample Command**

       ```
       curl --location \
         -H "Authorization:Bearer $TOKEN" \
         -H "Long-Running-Action: http://otmm-tcs:9000/lra-coordinator/011899ca-20f3-4d8c-9e92-76de355922fe" \
         --request PUT \
         -d '' "https://192.0.2.1:443/trip-service/api/trip/ http%3A%2F%2Fotmm-tcs%3A9000%2Flra-coordinator%2F011899ca-20f3-4d8c-9e92-76de355921fe"
       ```
    
    *  Run the following command to cancel the transaction.

       **Command Syntax**

       ```
       curl --location \
            -H "Authorization:Bearer $TOKEN" \
            -H "Long-Running-Action: LRA-ID" \
            --request DELETE \
            -d '' http://192.0.2.1:443/trip-service/api/trip/url-encoded-LRA-ID
       ```

       Where, `LRA-ID` is the value of the `id` attribute and `url-encoded-LRA-ID` is the value of the `encodedId` attribute that you have noted down.
    
       **Sample Command**

       ```
       curl --location \
         -H "Authorization:Bearer $TOKEN" \
         -H "Long-Running-Action: http://otmm-tcs:9000/lra-coordinator/011899ca-20f3-4d8c-9e92-76de355922fe" \
         --request DELETE \
         -d '' "https://192.0.2.1:443/trip-service/api/trip/ http%3A%2F%2Fotmm-tcs%3A9000%2Flra-coordinator%2F011899ca-20f3-4d8c-9e92-76de355921fe"
       ```

4.  Run the following commands to see the status of the booking.
    
    ```
    curl -X GET -H "Authorization:Bearer $TOKEN" https://192.0.2.1:443/hotelService/api/hotel | jq
    curl -X GET -H "Authorization:Bearer $TOKEN" https://192.0.2.1:443/flightService/api/flight | jq
    ```

5.  Run the application again to try out the failure scenario and to understand how the MicroTx coordinator performs the compensation. To enable you to test the failure scenario, the maximum number of available bookings for hotel is set at 3 and flight is set at 2. The flight service sample application rejects any additional booking requests that are made after two confirmed bookings. The third trip booking fails as only 2 flight seats are available. This leads to the cancellation (compensation) of a provisionally booked hotel within the trip and the trip is not booked. Since hotel is booked before flight, the MicroTx coordinator calls the Hotel Booking service to compensate the booking.

6. (Optional.) To change the maximum number of available bookings for hotel and flight, run the following commands:

    ```
    curl --location --request PUT 'http://192.0.2.1:443/hotelService/api/maxbookings?count=7'
    curl --location --request PUT 'http://192.0.2.1:443/flightService/api/maxbookings?count=7'
    ```

# Run the Trip Booking application in Docker Swarm

## Build and Push the Docker Images

The Trip Booking application is available in the installation bundle in the `samples/lra/lrademo` folder. This folder contains the application code for sample microservices which are used to book a hotel room and a flight ticket.

It is important that you tag the Docker images that you build with the address of the registry that you have created. For example, `198.51.100.1:5000`. This is required while distributing the apps to the Swarm.

Perform the following steps to build Docker images for each microservice in the sample.

1.  Run the following commands to build the Docker image for the Hotel Booking service.

    ```
    cd samples/lra/lrademo/hotel
    docker image build -t 198.51.100.1:5000/hotel:1.0 .
    ```

    Where, `198.51.100.1:5000` is the address of the Docker registry that you have created.
    
2.  Run the following commands to build the Docker image for the Flight Booking service.

    ```
    cd samples/lra/lrademo/flight
    docker image build -t 198.51.100.1:5000/flight:1.0 .
    ```

3.  Run the following commands to build the Docker image for the Trip Manager application.

    ```
        cd samples/lra/lrademo/trip-manager
        docker image build -t 198.51.100.1:5000/trip-manager:1.0 .
    ```

4.  Push the tagged Docker image to the Docker registry that you have created.
    
    **Syntax**

    ```
    docker push image\[:tag\]
    ```

    **Sample commands**
    
    The the following sample commands push the tagged images of Hotel Booking, Flight Booking, and Trip Manager applications.

    ```
    docker push 198.51.100.1:5000/hotel:1.0
    docker push 198.51.100.1:5000/trip-manager:1.0
    docker push 198.51.100.1:5000/flight:1.0
    ```

    When you build the Docker images, they are available in your local Docker container registry. When you push the Docker image, it becomes available in the docker registry that you have created for the swarm.
    
5.  Ensure that Java Development Kit (JDK) is installed on your local system, and then run the following commands in the Bash shell to set the following environment variables.

    ```
        export JAVA_HOME=jdk-install-dir
        export PATH=$JAVA_HOME/bin:$PATH
    ```

6.  Build the Trip client application which you can use to send a request to book a new trip.

    ```
    cd samples/lra/lrademo/trip-client
    mvn clean package
    ```

## Install the Trip Booking Application in Docker Swarm

All Swarm objects are described in manifests called stack files. The `tmm-stack-compose.yaml` stack file is located at `samples/docker`. This YAML file describes all the components and configurations of the Trip Booking application and transaction coordinator. Use this file to run and manage the microservices in Docker Swarm.

To run Trip Booking application:

1.  Deploy the `tmm-stack-compose.yaml` stack file.

    ```
    cd samples/docker
    docker stack deploy -c tmm-stack-compose.yaml tmmdemo
    ```

    Where, `tmmdemo` is the name of the Docker stack that you want to install. You can specify any other name.

    ```
        Output:
        Creating network tmmdemo_default
        Creating config tmmdemo_my_tcs_config
        Creating service tmmdemo_hotel
        Creating service tmmdemo_flight
        Creating service tmmdemo_trip-manager
        Creating service tmmdemo_otmm-tcs
    ```

2.  Verify that all services are ready. Use the following command to retrieve the list of services and their status.

    ```
        docker service ls
    ```

    The following sample output shows that all the services are ready.
    
    ```
    ID            NAME                  MODE         REPLICAS  IMAGE                              PORTS
    tjc0u55yavu4  registry              replicated   1/1       registry:2                         *:5000->5000/tcp
    qvzeovz8729y  tmmdemo_flight        replicated   1/1       198.51.100.1:5000/flight:1.0       *:8083->8083/tcp
    ifmqd521im28  tmmdemo_hotel         replicated   1/1       198.51.100.1:5000/hotel:1.0        *:8082->8082/tcp
    ilkvx4emyv8c  tmmdemo_otmm-tcs      replicated   1/1       198.51.100.1:5000/tmm:latest       *:9000->9000/tcp
    m069vayql490  tmmdemo_trip-manager  replicated   1/1       198.51.100.1:5000/trip-manager:1.0 *:8081->8081/tcp
    ```

    Note down the port numbers on which the applications are running as you will need to provide the port number when you run the sample application.

When the services are ready, you can run the Trip Booking application.

## Run the Trip Booking Application

To run the Trip Booking application to book a hotel room and flight ticket:

1.  Set the URL for the Trip Manager service.

    **Syntax**

    ```    
    export TRIP_SERVICE_URL=<IP-address-of-Docker-registry>:<port-of-sample-app>/trip-service/api/trip
    ```

    **Example**

    ```
    export TRIP_SERVICE_URL=http://198.51.100.1:8081/trip-service/api/trip
    ```

    Where,
    *   `198.51.100.1` is the IP address of the Docker registry to which you have pushed the Docker images.
    *   `8081` is the port number on which the Trip Manager service is running.
    Provide these details based on your environment.

2.  Run the Trip Client application.

    cd samples/lra/lrademo/trip-client
    java -jar target/trip-client.jar

    The Trip Booking Service console is displayed.

3.  Type **y** to confirm that you want to run the Trip Booking application, and then press Enter.

    The Trip Booking application provisionally books a hotel room and a flight ticket and displays the details of the provisional booking.

4.  Type **y** to confirm the provisional booking, and then press Enter.

    Your booking is confirmed and information about your confirmed booking is displayed.

5.  To retrieve the details of your booking, run the following command.

    ```
    curl --location --request GET http://198.51.100.1:8081/trip-service/api/trip | jq
    ```

    Where,

    *   `198.51.100.1` is the IP address of the Docker registry to which you have pushed the Docker images.
    *   `8081` is the port number on which the Trip Booking service is running.

    **Sample Response**

    ```
        [
          {
            "details": [
              {
                "encodedId": "http%3A%2F%2Fotmm-tcs%3A9000%2Fapi%2Fv1%2Flra-coordinator%2F9c44a549-9047-41d3-a3f0-623da46c6b2b",
                "id": "http://otmm-tcs:9000/api/v1/lra-coordinator/9c44a549-9047-41d3-a3f0-623da46c6b2b",
                "name": "Acme",
                "status": "CONFIRMED",
                "type": "Hotel"
              },
              {
                "details": [],
                "encodedId": "http%3A%2F%2Fotmm-tcs%3A9000%2Fapi%2Fv1%2Flra-coordinator%2F9c44a549-9047-41d3-a3f0-623da46c6b2b",
                "id": "http://otmm-tcs:9000/api/v1/lra-coordinator/9c44a549-9047-41d3-a3f0-623da46c6b2b",
                "name": "A123",
                "status": "CONFIRMED",
                "type": "Flight"
              }
            ],
            "encodedId": "http%3A%2F%2Fotmm-tcs%3A9000%2Fapi%2Fv1%2Flra-coordinator%2F9c44a549-9047-41d3-a3f0-623da46c6b2b",
            "id": "http://otmm-tcs:9000/api/v1/lra-coordinator/9c44a549-9047-41d3-a3f0-623da46c6b2b",
            "name": "Trip",
            "status": "CONFIRMED",
            "type": "Trip"
          }
        ]
    ```

6.  Run the following commands to see the list of hotel bookings.

    **Sample Command**

    ```
        curl --location --request GET http://198.51.100.1:8082/hotelService/api/hotel | jq
    ```

    Where,

    *   `198.51.100.1` is the IP address of the Docker registry to which you have pushed the Docker images.
    *   `8082` is the port number on which the Hotel Booking service is running.

    Provide these details based on your environment.

    **Sample Response**

    ```
        [
          {
            "encodedId": "http%3A%2F%2Fotmm-tcs%3A9000%2Fapi%2Fv1%2Flra-coordinator%2F9c44a549-9047-41d3-a3f0-623da46c6b2b",
            "id": "http://otmm-tcs:9000/api/v1/lra-coordinator/9c44a549-9047-41d3-a3f0-623da46c6b2b",
            "name": "Acme",
            "status": "CONFIRMED",
            "type": "Hotel"
          }
        ]
    ```

    Note down the encoded ID. You will need to provide this value if you want to retrieve details of a specific flight or hotel booking.

7.  Run the following commands to see the list of flight bookings.

    **Sample Commands**

    ```
    curl --location --request GET http://198.51.100.1:8083/flightService/api/flight | jq
    ```

    Where,
    *   `198.51.100.1` is the IP address of the Docker registry to which you have pushed the Docker images.
    *   `8083` is the port number on which the Flight Booking service is running respectively.

    Provide these details based on your environment.

    **Sample Response**

    ```
        [
          {
            "details": [],
            "encodedId": "http%3A%2F%2Fotmm-tcs%3A9000%2Fapi%2Fv1%2Flra-coordinator%2F9c44a549-9047-41d3-a3f0-623da46c6b2b",
            "id": "http://otmm-tcs:9000/api/v1/lra-coordinator/9c44a549-9047-41d3-a3f0-623da46c6b2b",
            "name": "A123",
            "status": "CONFIRMED",
            "type": "Flight"
          }
        ]
    ```

    Note down the encoded ID. You will need to provide this value if you want to retrieve details of a specific flight or hotel booking.

8.  Run the following commands to see the details of a specific trip, hotel, or flight booking. You can specify the encoded ID of the booking for which you want to retrieve the details.

    **Command Syntax**

    ```
    curl --location --request GET http://198.51.100.1:8081/trip-service/api/trip/<encodedId> | jq
    curl --location --request GET http://198.51.100.1:8082/hotelService/api/hotel/<encodedId> | jq
    curl --location --request GET http://198.51.100.1:8083/flightService/api/flight/<encodedId> | jq
    ```

    **Sample Command**

    The following command retrieves the trip details of the specified encoded ID.

    ```
    curl --location \
         --request GET http://198.51.100.1:8081/trip-service/api/trip/http%3A%2F%2Fotmm-tcs%3A9000%2Fapi%2Fv1%2Flra-coordinator%2F9c44a549-9047-41d3-a3f0-623da46c6b2b | jq
    ```

9.  Run the application again to try out the failure scenario and to understand how the MicroTx coordinator performs the compensation. To enable you to test the failure scenario, the maximum number of available bookings for hotel is set at 3 and flight is set at 2. The flight service sample application rejects any additional booking requests that are made after two confirmed bookings. The third trip booking fails as only 2 flight seats are available. This leads to the cancellation (compensation) of a provisionally booked hotel within the trip and the trip is not booked. Since hotel is booked before flight, the MicroTx coordinator calls the Hotel Booking service to compensate the booking.

10. (Optional.) To change the maximum number of available bookings for hotel and flight, run the following commands:

    ```
    curl --location --request PUT 'http://198.51.100.1:8082/hotelService/api/maxbookings?count=7'
    curl --location --request PUT 'http://198.51.100.1:8083/flightService/api/maxbookings?count=7'
    ```
