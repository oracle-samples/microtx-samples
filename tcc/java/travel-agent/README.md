# Travel Agent Application

Sample Travel Agent App to demonstrate TCC Application using Java TRM lib for TCC.

## Build and run

With JDK11+

```
mvn package
java -jar target/travel-agent.jar
```

## Exercise the application

## Book travel - Both Hotel and Flight booking

### One-Step Trip Booking

Trip booking with single api call. If the associated flight and hotel booking is successful, 
trip booking api will return the successful trip booking id and associated hotel and flight booking id.

```
curl -X POST -H "Content-Type: application/json" http://localhost:8080/travel-agent/api/bookings
```
##### Output
```
{
    "tripBookingId": "840c7f0c-d87e-4694-aba5-0846e716ce99",
    "message": "Successfully booked the trip",
    "status": "CONFIRMED",
    "flightBooking": {
        "bookingId": "e32e1cbf-4d6d-431a-a5af-d48570e02666",
        "bookingUri": "http://localhost:8082/api/bookings/e32e1cbf-4d6d-431a-a5af-d48570e02666",
        "expires": 120000,
        "name": "Flight-01",
        "startTime": 1677146471233,
        "type": "FLIGHT"
    },
    "hotelBooking": {
        "bookingId": "e140cdba-30a6-44c0-b7c2-c168f763641c",
        "bookingUri": "http://localhost:8081/api/bookings/e140cdba-30a6-44c0-b7c2-c168f763641c",
        "expires": 120000,
        "name": "Hotel-01",
        "startTime": 1677146471209,
        "type": "HOTEL"
    }
}

```

If booking has to be cancelled, pass cancel parameter as part of trip booking api

```
curl -X POST -H "Content-Type: application/json" http://localhost:8080/travel-agent/api/bookings?cancel=true
```

### Two-Step Trip Booking
Trip booking with 2-step process. First API reserves the booking while the status will be RESERVED and user can choose to either confirm or cancel the trip booking. 

If user confirms and the associated flight and hotel booking is successful, 
trip booking api will return the successful trip booking id with CONFIRMED status and associated hotel and flight booking id.
And if user cancels and the associated flight and hotel booking will be cancelled,
trip booking api will return the cancelled trip booking id with CANCELLED status and associated hotel and flight booking id.

##### Trip reservation  
```
curl --location --request POST 'http://localhost:8080/travel-agent/api/bookings/reserve?hotelName=Hilton&flightNumber=AA2250' \
--header 'Accept: application/json' \
-v
```
##### Confirm Trip booking
Confirming trip booking requires two things:
    1. `tripBookingId`, which is returned from trip reservation api.
    2. `link` header which contains the MicroTx TCC transaction Id, which is also returned from trip reservation api `response headers`.
        Whole value from response header (`link`) can also be used or just the link header with `tcc-transaction` will work as mentioned below example
```
curl --location -H "link: <http://localhost:9000/api/v1/tcc-transaction/4e6dc225-d8af-4988-8446-a70e4cbd1e44>; rel=\"https://otmm.oracle.com/tcc-transaction\"" \ 
--request PUT -d '' "http://localhost:8080/travel-agent/api/confirm/{tripBookingId}"
```

##### Cancel Trip booking
Confirming trip booking requires two things:
   1. `tripBookingId`, which is returned from trip reservation api.
   2. `link` header which contains the MicroTx TCC transaction Id, which is also returned from trip reservation api `response headers`.
   Whole value from response header (`link`) can also be used or just the link header with `tcc-transaction` will work as mentioned below example
```
curl --location --request DELETE 'http://localhost:8080/travel-agent/api/cancel/{tripBookingId}' \
-H "link: <http://localhost:9000/api/v1/tcc-transaction/abbc1924-73e7-443b-99ac-3e90e2f0148f>; rel=\"https://otmm.oracle.com/tcc-transaction\"" \
-H 'Accept: application/json'
```

### Reading Trip Booking status
For all past bookings records, make the GET request

```bash
curl http://localhost:8080/travel-agent/api/bookings
```

GET request with booking ID as parameter will produce json response of that particular trip booking id

```bash
curl http://localhost:8080/travel-agent/api/bookings/{tripBookingId}
```

## Build the Docker Image

```
docker build -t travel-agent:1.0 .
```

## Start the application with Docker

```
docker run --rm -p 8080:8080 travel-agent:1.0
```

Exercise the application as described above
