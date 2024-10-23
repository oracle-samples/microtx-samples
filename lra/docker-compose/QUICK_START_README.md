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

## Build Docker Images for Sample LRA Application

Perform the following steps to build Docker images for each microservice in the sample. The images for the apps are built and are also tagged with `127.0.0.1:5000` - the address of the registry created earlier. This is important when distributing the apps to the swarm.

**NOTE** : installation_directory -> The place where distribution is uncompressed

1. Run the following commands to build the Docker image for the hotel application. Then, push the image to the docker registry after the build is completed.

   ```bash
   cd installation_directory/otmm-24.2.2/samples/lra/lrademo/hotel
   docker image build -t 127.0.0.1:5000/hotel:1.0 .
   docker push 127.0.0.1:5000/hotel:1.0
   ```
2. Run the following commands to build the Docker image for the flight application. Then, push the image to the docker registry after the build is completed

   ```bash
   cd installation_directory/otmm-24.2.2/samples/lra/lrademo/flight
   docker image build -t 127.0.0.1:5000/flight:1.0 .
   docker push 127.0.0.1:5000/flight:1.0
   ```
3. Run the following commands to build the Docker image for the trip manager application. Then, push the image to the docker registry after the build is completed.

   ```bash
   cd installation_directory/otmm-24.2.2/samples/lra/lrademo/trip-manager
   docker image build -t 127.0.0.1:5000/trip-manager:1.0 .
   docker push 127.0.0.1:5000/trip-manager:1.0
   ```
4. Build the Trip-Client application that will be used to create a new Trip booking. Make sure you have JDK installed and JAVA_HOME env variable set to the JDK installation folder

   ```bash
   cd installation_directory/otmm-24.2.2/samples/lra/lrademo/trip-client
   mvn clean package
   ```

## Install LRA Sample Application Stack

A simple stack file is provided to run and manage the sample application along with the transaction coordinator. The stack file called `tmm-stack-compose.yaml` is located at `samples/lra/docker-compose`

1. View the LRA sample application stack file contents.

```bash
cat samples/lra/docker-compose/tmm-stack-compose.yaml
```

2. Copy the tcs-docker-swarm.yaml file  from `installation_directory/otmm-RELEASE/otmm/docker-swarm/` to  `samples/lra/docker-compose`.

```bash
cp installation_directory/otmm-RELEASE/otmm/docker-swarm/tcs-docker-swarm.yaml  sample_app_directory/samples/lra/docker-compose
```
3. Run the following commands to install the LRA sample application stack.

   ```bash
   cd samples/lra/docker-compose
   docker stack deploy -c tmm-stack-compose.yaml tmmdemo

   Output:
   Creating network tmmdemo_default
   Creating config tmmdemo_my_tcs_config
   Creating service tmmdemo_hotel
   Creating service tmmdemo_flight
   Creating service tmmdemo_trip-manager
   Creating service tmmdemo_otmm-tcs
   ```
3. Verify that all services are ready. Use the following command to retrieve the list of services and their status.

```bash
docker service ls
```

The following sample output shows that all the services are ready and in the `Running` state.

```bash
ID             NAME                   MODE         REPLICAS   IMAGE                             PORTS
tjc0u55yavu4   registry               replicated   1/1        registry:2                        *:5000->5000/tcp
qvzeovz8729y   tmmdemo_flight         replicated   1/1        127.0.0.1:5000/flight:1.0         *:8083->8083/tcp
ifmqd521im28   tmmdemo_hotel          replicated   1/1        127.0.0.1:5000/hotel:1.0          *:8082->8082/tcp
ilkvx4emyv8c   tmmdemo_otmm-tcs       replicated   1/1        127.0.0.1:5000/tmm:latest         *:9000->9000/tcp
m069vayql490   tmmdemo_trip-manager   replicated   1/1        127.0.0.1:5000/trip-manager:1.0   *:8081->8081/tcp
```

## Run an LRA Transaction

**Note: On Windows, the default curl command has very different options than the one mentioned in the examples shown below. For running the commands shown below, consider installing the curl utility from** - https://curl.se/windows/

1. Run the trip client application to book a trip with a hotel and flight.

   ```bash
   export TRIP_SERVICE_URL=<trip-service-url>
   example:
   export TRIP_SERVICE_URL=http://127.0.0.1:8081/trip-service/api/trip
   ```

   On Windows, you can do:

   ```bash
   SET TRIP_SERVICE_URL=<trip-service-url>
   example:
   SET TRIP_SERVICE_URL="http://127.0.0.1:8081/trip-service/api/trip"
   ```

   Execute the Trip Client Application:

   ```bash
   cd installation_directory/otmm-24.2.2/samples/lra/lrademo/trip-client
   java -jar target/trip-client.jar
   ```

   The application will bring up the Trip Booking Service console. Answer yes "y" for - Do you want to proceed ?
2. Confirm or Cancel the provisional booking. We will confirm in this case.

```bash
BOOKING SUCCESS - Provisional Booking successful. At this point you can confirm or cancel the booking.
Confirm Booking (y) / (n) ?
y
You confirmed your booking: true
- Confirming your booking ...
/ Fetching Final Booking Status ...
\
Final Trip Booking Info:
    {"id":"http://otmm-tcs:9000/api/v1/lra-coordinator/9c44a549-9047-41d3-a3f0-623da46c6b2b","name":"Trip","type":"Trip","status":"CONFIRMED"}
    Associated Booking: {"id":"http://otmm-tcs:9000/api/v1/lra-coordinator/9c44a549-9047-41d3-a3f0-623da46c6b2b","name":"Hilton","type":"Hotel","status":"CONFIRMED"}
    Associated Booking: {"id":"http://otmm-tcs:9000/api/v1/lra-coordinator/9c44a549-9047-41d3-a3f0-623da46c6b2b","name":"A123","type":"Flight","status":"CONFIRMED"}

```

3. Run the following commands to see the list of the trip bookings, hotel bookings and flight bookings.

```bash
curl --location --request GET http://127.0.0.1:8081/trip-service/api/trip | jq
curl --location --request GET http://127.0.0.1:8082/hotelService/api/hotel | jq
curl --location --request GET http://127.0.0.1:8083/flightService/api/flight | jq
```

4. Run the following commands to see an individual trip/hotel/flight booking

   Command Format:

   ```bash
   curl --location --request GET http://127.0.0.1:8081/trip-service/api/trip/<encodedId> | jq
   curl --location --request GET http://127.0.0.1:8082/hotelService/api/hotel/<encodedId> | jq
   curl --location --request GET http://127.0.0.1:8083/flightService/api/flight/<encodedId> | jq
   ```

   Example:

   ```bash
   curl --location --request GET http://127.0.0.1:8081/trip-service/api/trip/http%3A%2F%2Fotmm-tcs%3A9000%2Fapi%2Fv1%2Flra-coordinator%2F9c44a549-9047-41d3-a3f0-623da46c6b2b | jq

   ```