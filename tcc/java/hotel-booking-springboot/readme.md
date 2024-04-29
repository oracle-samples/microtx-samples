## Introduction

The springboot application demonstrate the hotel booking microservice. The application participate in TCC transaction with MicroTx coordinator on localhost port 8081

The generation of the executable jar file can be performed by issuing the following command

With JDK17+

```
mvn clean package
```

This will create an executable jar file hotel-booking-springboot.jar within the target maven folder. This can be started by executing the following command

```
java -jar target/hotel-booking-springboot.jar
```


## Build the Docker Image

```
docker build -t hotel-booking-springboot:1.0 .
```

## Start the application with Docker

```
docker run --rm -p 8081:8081 hotel-booking-springboot:1.0
```

Exercise the application as described above