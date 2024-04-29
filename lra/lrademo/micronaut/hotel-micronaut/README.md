# About
TMM LRA demo , demonstration of a Java microservice for Hotel booking built on the Micronaut framework.
Default TRM LRA coordinator URL is "http://localhost:9000/api/v1/lra-coordinator"


## Quick Start
To run build:

```
mvn clean package
```

To run the application:
```
java -jar target/hotel-micronaut.jar
```
To run the application with different TRM coordinator assign the URL to microtx.lra.coordinator-url system variable:
```
java -jar -Dmicrotx.lra.coordinator-url=<url> target/hotel-micronaut.jar
```
To create a docker image:
```
docker image build -t=<image_name> .
```
To run the docker image:
```
docker container run <image_name>
```
To run the docker image with different TRM coordinator assign the URL to MICROTX_LRA_COORDINATOR_URL environment variable:
```
docker container run -e MICROTX_LRA_COORDINATOR_URL=<URL> <image_name>
```
To change the Max Booking Count:
```
#set the count value as required

curl --location --request PUT 'http://localhost:8082/hotelService/api/maxbookings?count=7'
```