**Table of Contents**

<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->

- [Before You Begin](#before-you-begin)
- [Build the micronaut Trip Booking Service in Local Environment](#run-the-micronaut-trip-booking-service-in-local-environment)
- [Build Docker Images for micronaut Trip Booking Application](#build-docker-images-for-micronaut-trip-booking-application)

<!-- TOC end -->

# Before You Begin

This readme explain only about building the micronaut sample applications. For rest of the steps [follow this README](../README.md)

## Build and Run Individual Microservices in Local Environment


1. Run the following command to build and run the Flight Booking application.

   ```
   cd /samples/lra/lrademo/micronaut/flight-micronaut
   mvn clean package 
   java -jar target target/flight-micronaut.jar
   
   ```

2. Run the following command to build and run the Hotel Booking application.

   ```
   cd /samples/lra/lrademo/micronaut/hotel-micronaut
   mvn clean package 
   java -jar target target/hotel-micronaut.jar
   
   ```
3. Run the following command to build and run the Trip Manager application.

   ```
   cd /samples/lra/lrademo/micronaut/trip-manager-micronaut
   mvn clean package 
   java -jar target/trip-manager-micronaut.jar
   ```

## Build Docker Images for Trip Booking Application

Perform the following steps to build Docker images for each microservice in the Trip Booking application:

1. Run the following commands to build the Docker image for the Hotel Booking service.

   ```
   cd samples/lra/lrademo/micronaut/hotel-micronaut
   docker image build -t hotel-micronaut:1.0 .
   ```

   When the image is successfully built, the following message is displayed.
   Successfully tagged hotel-micronaut:1.0

2. Run the following commands to build the Docker image for the Flight Booking service.

   ```
   cd samples/lra/lrademo/micronaut/flight-micronaut
   docker image build -t flight-micronaut:1.0 .
   ```

   When the image is successfully built, the following message is displayed.
   Successfully tagged flight-micronaut:1.0

3. Run the following commands to build the Docker image for the Trip Manager application.

   ```
   cd samples/lra/lrademo/micronaut/trip-manager-micronaut
   docker image build -t trip-manager-micronaut:1.0 .
   ```

   When the image is successfully built, the following message is displayed.

   Successfully tagged trip-manager-micronaut:1.0
