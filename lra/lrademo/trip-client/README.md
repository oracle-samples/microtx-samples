# About
TMM LRA demo Trip-Client Java application. This application provides console user interface to reserve and confirm/cancel the fight and hotel booking.
The application interacts with the trip-manager microservice to perform the bookings.

## Quick Start
To run build:

```
mvn clean package
```

To run the application:
```
export TRIP_SERVICE_URL=<trip-service-url>
example: 
export TRIP_SERVICE_URL=http://localhost:8080/trip-service/api/trip

example when trip-service is deployed in kubernetes:
export TRIP_SERVICE_URL=http://152.70.120.125/trip-service/api/trip

If authentication or authorization is enabled in the kubernetes cluster, set the access token and refresh token as environment variables.
export ACCESS_TOKEN=<access_token>
export REFRESH_TOKEN=<refresh_token>

java -jar target/trip-client.jar
```