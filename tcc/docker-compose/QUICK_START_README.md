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

1. Load the Transaction Manager for Microservices image in the local Docker repository. The Transaction Manager for Microservices image is located at `installation_directory/otmm-24.4.1/otmm/image/tmm-24.4.1.tgz`.

   ```bash
   cd installation_directory/otmm-24.4.1/otmm
   docker load < image/tmm-24.4.1.tgz
   ```

   On Windows, run the following command:

   ```bash
   cd installation_directory/otmm-24.4.1/otmm
   docker load -i image/tmm-24.4.1.tgz
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
   tmm                                                            24.4.1      bcc91ec952a6   4 days ago      610MB
   ```

   b. Use the following command to create a new tag.

   ```bash
   docker tag tmm:24.4.1 127.0.0.1:5000/tmm
   ```

   Here we are created the same image tmm  with a tag `127.0.0.1:5000/tmm`

   c. Push the image (new tag) to the registry.

   ```bash
   docker push 127.0.0.1:5000/tmm
   ```


# Deploy TCC Sample Application

The TCC sample application is available in the installation bundle in the `installation_directory/otmm-24.4.1/samples/tcc` folder.

View the TCC sample application stack file contents.

```bash
cat samples/tcc/docker-compose/tmm-stack-compose.yaml
```

Copy the tcs-docker-swarm.yaml file  from `installation_directory/otmm-RELEASE/otmm/docker-swarm/` to  `samples/tcc/docker-compose`.

```bash
cp installation_directory/otmm-RELEASE/otmm/docker-swarm/tcs-docker-swarm.yaml  sample_app_directory/samples/tcc/docker-compose
```


## Build Docker Images for Sample TCC Application

Perform the following steps to build Docker images for each microservice in the sample. The images for the apps are built and are also tagged with `127.0.0.1:5000` - the address of the registry created earlier. This is important when distributing the apps to the swarm.

**NOTE** : installation_directory -> The place where distribution is uncompressed

1. Run the following commands to build the Docker image for the travel-agent application. Then, push the image to the docker registry after the build is completed.

   ```bash
   cd installation_directory/otmm-24.4.1/samples/tcc/java/travel-agent
   docker image build -t 127.0.0.1:5000/tcc-travel-agent:1.0 .
   docker push 127.0.0.1:5000/tcc-travel-agent:1.0
   ```
2. Run the following commands to build the Docker image for the flight application. Then, push the image to the docker registry after the build is completed

   ```bash
   cd installation_directory/otmm-24.4.1/samples/tcc/java/flight-booking
   docker image build -t 127.0.0.1:5000/tcc-flight:1.0 .
   docker push 127.0.0.1:5000/tcc-flight:1.0
   ```
3. Run the following commands to build the Docker image for the hotel application. Then, push the image to the docker registry after the build is completed.

   ```bash
   cd installation_directory/otmm-24.4.1/samples/tcc/java/hotel-booking
   docker image build -t 127.0.0.1:5000/tcc-hotel:1.0 .
   docker push 127.0.0.1:5000/tcc-hotel:1.0
   ```

The Docker images that you have created are available in your local Docker container registry by default and then when pushed, they will be available in the docker registry that was created / started for swarm.

## Update the tmm-stack-compose.yaml File for TCC

The sample application stack file also contains the deployment configuration details for the TCC sample application.

While deploying the sample application to the docker swarm, update the `tmm-stack-compose.yaml` file by uncommenting the TCC services, specify the built image under the specified service.

To provide the configuration and environment details in the `tmm-stack-compose.yaml` file:

1. Open the `tmm-stack-compose.yaml` file, which is located at `samples/tcc/docker-compose/tmm-stack-compose.yaml`, in any code editor. This file contains the configuration details for the TCC Sample App services. Uncomment the section for TCC Services.
2. Provide details of all the sample application images that you have in the docker registry. For example, 127.0.0.1:5000/tcc-travel-agent:1.0
3. Save your changes.

```yaml
# ...
# TCC Sample Application (services) below (Uncomment and edit to run)  

tcc-travel-agent:
   image: "127.0.0.1:5000/tcc-travel-agent:1.0"
   ports:
      - "8088:8080"
   deploy:
      ...
   environment:
      ...

tcc-flight:
   image: "127.0.0.1:5000/tcc-flight:1.0"
   ports:
      - "8089:8082"
   deploy:
      ...
   environment:
      ...

tcc-hotel:
   image: "127.0.0.1:5000/tcc-hotel:1.0"
   ports:
      - "8090:8081"
   deploy:
      ...
   environment:
      ...
```

## Deploy the TCC Sample Application Stack

A simple stack file is provided to run and manage the sample application along with the transaction coordinator. The stack file called `tmm-stack-compose.yaml` is located at `samples/tcc/docker-compose`

1. Run the following commands to install the TCC sample application stack.

   ```bash
   cd samples/tcc/docker-compose/docker
   docker stack deploy -c tmm-stack-compose.yaml tmmdemo

   Output:
   Creating network tmmdemo_default
   Creating config tmmdemo_my_tcs_config
   Creating service tmmdemo_otmm-tcs
   Creating service tmmdemo_tcc-travel-agent
   Creating service tmmdemo_tcc-flight
   Creating service tmmdemo_tcc-hotel
   ```
2. Verify that all services are ready. Use the following command to retrieve the list of services and their status.

```bash
docker service ls
```

The following sample output shows that all the services are ready and in the `Running` state.

```bash
ID             NAME                       MODE         REPLICAS   IMAGE                                 PORTS
kvt41ta09s2d   registry                   replicated   1/1        registry:2                            *:5000->5000/tcp
t6cu1xrj143c   tmmdemo_otmm-tcs           replicated   1/1        127.0.0.1:5000/tmm:latest             *:9000->9000/tcp
qazeb7phlrrx   tmmdemo_tcc-flight         replicated   1/1        127.0.0.1:5000/tcc-flight:1.0         *:8089->8082/tcp
r6sz4234e561   tmmdemo_tcc-hotel          replicated   1/1        127.0.0.1:5000/tcc-hotel:1.0          *:8090->8081/tcp
76hbb5u3je6z   tmmdemo_tcc-travel-agent   replicated   1/1        127.0.0.1:5000/tcc-travel-agent:1.0   *:8088->8080/tcp
```

## Run an TCC Transaction

**Note: On Windows, the default curl command has very different options than the one mentioned in the examples shown below. For running the commands shown below, consider installing the curl utility from** - https://curl.se/windows/

1. Book the travel using the travel agent - Both Hotel and Flight booking and confirm the transaction.

```
curl -X POST -H "Content-Type: application/json" http://localhost:8088/api/bookings
```
   
2. Book the travel using the travel agent - Both Hotel and Flight booking and cancel the transaction.

```
curl -X POST -H "Content-Type: application/json" http://localhost:8088/api/bookings?cancel=true
```