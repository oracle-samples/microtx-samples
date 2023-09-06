# TMM Long Running Action sample service

- Demonstrates microprofile-lra standard functionality: https://github.com/eclipse/microprofile-lra
- Demo uses console log messages for verifications.

### Trip Service(Helidon service):
- Post call on endpoint "/trip" starts an LRA due to @LRA annotation on method "bookTrip" and registers the service with the LRA coordinator.
- Method "bookTrip" calls hotel service for a booking.
- Method "bookTrip" calls flight service for a booking.
- After the function "bookTrip" finishes, the LRA client automatically call closes or cancel on the LRA based on the results of the above bookings. This is because the LRA is defined as "end=true" (default). 

### Hotel Service(Helidon service):
- *Note Helidon LRA client is still not available in maven central hence snapshot version is used.
- Call to method "bookRoom" by trip manager is executed within LRA started and propagated by the trip manager service due to @LRA value "Mandatory" and registers the service with the LRA coordinator

### Flight Service (Express service):
- endpoint "/flight" called by trip manager is executed within LRA started and propagated by the trip manager service due to @LRA value "Mandatory" and registers the service with the LRA coordinator

*******************************************************************************************************

### Demo 

#### Prerequisites
- A kubernetes cluster 
- Run TMM TCS as a service in the kubernetes cluster with service name "tmm-tcs"

Step 1: Build the hotel, flight and trip manager services
```
sh build.sh
```

Step 2: Deploy the hotel, flight and trip manager services in a kubernetes cluster
```
kubectl apply -f deployment.yaml
```
Step 3: Provisional Booking scenario: Call the trip manager service to provisionally book a trip including the hotel and flight
```
curl -X POST -d '' http://trip-manager:8080/trip-service/api/trip?hotelName=Mercury&flightNumber=A123
```
Sample Response
```

{
"cancelPending": false, "details": [
{
"cancelPending": false, "details": [
],
"encodedId": "http%3A%2F%2Fomtm-tcs%3A9000%2Flra- coordinator%2F011899ca-20f3-4d8c-9e92-76de355921fe",
"id": "http://otmm-tcs:9000/lra-coordinator/ 011899ca-20f3-4d8c-9e92-76de355921fe",
"name": "Mercury", "status": "PROVISIONAL", "type": "Hotel"
}, {
"cancelPending": false, "details": [
],
"encodedId": "http%3A%2F%2Fomtm-tcs%3A9000%2Flra- coordinator%2F011899ca-20f3-4d8c-9e92-76de355921fe",
"id": "http://otmm-tcs:9000/lra-coordinator/ 011899ca-20f3-4d8c-9e92-76de355921fe",
"name": "A123", "status": "PROVISIONAL", "type": "Flight"
} ],
"encodedId": "http%3A%2F%2Fomtm-tcs%3A9000%2Flra- coordinator%2F011899ca-20f3-4d8c-9e92-76de355921fe",
"id": "http://otmm-tcs:9000/lra-coordinator/ 011899ca-20f3-4d8c-9e92-76de355921fe",
"name": "Aggregate Booking", "status": "PROVISIONAL", "type": "Trip"
}
```
Step 4: Confirm or Cancel Booking scenario: Call the trip manager service to confirm or cancel the provisional trip booking including the hotel and flight. The encodedId is encodedId and LRA-ID is id in the response from step 3

To Confirm the booking:
```
curl --location --request PUT -H "Long-Running-Action: LRA-ID" -d '' http://trip-manager:8080/trip-service/api/trip/<encodedId>

Example:
curl --location --request PUT -H "Long-Running-Action: LRA-ID" -d ''
'http://trip-manager:8080/trip-service/api/trip/http%3A%2F%2Flocalhost%3A9000%2Fapi%2Fv1%2Flra-coordinator%2F11fcb9aa-cf72-47a0-96d2-d62d33650e6b'
```
To Cancel the booking:
```
curl --location --request DELETE -H "Long-Running-Action: LRA-ID" -d '' http://trip-manager:8080/trip-service/api/trip/<encodedId>

Example:
curl --location --request DELETE -H "Long-Running-Action: LRA-ID" -d '' 'http://trip-manager:8080/trip-service/api/trip/http%3A%2F%2Flocalhost%3A9000%2Fapi%2Fv1%2Flra-coordinator%2F11fcb9aa-cf72-47a0-96d2-d62d33650e6b'
```
Step 5: Get Booking Details: Call the trip manager service to get the trip booking details
```
curl --location --request GET 'http://trip-manager:8080/trip-service/api/trip/http%3A%2F%2Flocalhost%3A9000%2Fapi%2Fv1%2Flra-coordinator%2F11fcb9aa-cf72-47a0-96d2-d62d33650e6b'
```
Step 6: Compensate scenario: Maximum number of available bookings for hotel is set at 3 and flight is set at 2. The third trip booking fails as there are only 2 flight seats avaiable. Since hotel is booked before flight, the coordinator calls hotel to compensate the booking.

Note:
To change the Max Booking Count in Hotel and Flight Services:
```
#set the count value as required

curl --location --request PUT 'http://hotel:8080/hotelService/api/maxbookings?count=7'
```

```
#set the count value as required

curl --location --request PUT 'http://flight:8080/flightService/api/maxbookings?count=7'
```