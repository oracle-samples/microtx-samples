## Introduction


The springboot application demonstrate the flight booking microservice. The application participate in TCC transaction with MicroTx coordinator on localhost port 8082 

The generation of the executable jar file can be performed by issuing the following command .

With JDK17+

```
mvn clean package
```

This will create an executable jar file flight-booking-springboot.jar within the target maven folder. This can be started by executing the following command

```
java -jar target/flight-booking-springboot.jar
```


## Build the Docker Image

```
docker build -t flight-booking-springboot:1.0 .
```

## Start the application with Docker

```
docker run --rm -p 8082:8082 flight-booking-springboot:1.0
```

Exercise the application as described above