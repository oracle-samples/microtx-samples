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
```
Example, if `Trip-manager` service is running on `http://localhost:8081`, then export below variable:

To call LRA participants Flight and Hotel booking asynchronously:
```
export TRIP_SERVICE_URL=http://localhost:8081/trip-service/api/trip
```
To call LRA participants Flight and Hotel booking synchronously:
```
export TRIP_SERVICE_URL=http://localhost:8081/trip-service/api/sync/trip
```
If trip-manager service is deployed in kubernetes, update the right ingress host name:
```
export TRIP_SERVICE_URL=http://<Ingress-IP>/trip-service/api/trip
```
If authentication or authorization is enabled in the kubernetes cluster, set the access token and refresh token as environment variables.
```
export ACCESS_TOKEN=<access_token>
export REFRESH_TOKEN=<refresh_token>
```
Execute Trip-Client Program by running below command
```
java -jar target/trip-client.jar
```