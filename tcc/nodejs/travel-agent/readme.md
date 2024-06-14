# About

TMM TCC nodejs travel agent sample

## Quick Start

Install dependency :

Download the NodeJs Lib file from the official MicroTx Distribution package : https://www.oracle.com/in/database/transaction-manager-for-microservices/

Copy `oracle-microtx-24.2.1.tgz` file from `<distribution-package-dir>/lib/nodejs` to the travel-agent folder.

```
cp <distribution-package-dir>/lib/nodejs/oracle-microtx-24.2.1.tgz ./
```

```
$ sudo npm install
```

Run the server in development mode:

```
$ npm run dev
```

To run the server in development mode on a custom port, eg 8085:

```
$ npm_config_http_port=8085 npm run dev
```

To run the server in production mode:

```
$ npm run prod
```

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

## Docker

Build the docker image.

```
- $ docker build --network host -t <image_name> .
```

Run the docker image.

```
- $ docker run -p 5401:8083 -d <image_name>
```