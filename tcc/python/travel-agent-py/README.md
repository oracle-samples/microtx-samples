# Travel Agent Application

## To run application locally

#### 1. Create virtual env (venv).
```
virtualenv -p python3 venv

source venv/bin/activate

pip3 install -r requirements.txt
```

#### 2. Install tmmlib file after setting up virtual env.
```
pip3 install <wheel file path; .whl extension>
```

#### 3. Now, run application.
```
python3 project/app.py
```

## To build the Docker Image
```
docker build -t travel-agent-py:1.0 .
```

## To start the application with Docker

```
docker run --rm -p 8080:8080 travel-agent-py:1.0
```

## Exercise the application


### Trip Booking - Both Hotel and Flight booking

### One-Step Trip Booking

Trip booking with api call. If the associated flight and hotel booking is successful,
trip booking api will return the successful trip booking id and associated hotel and flight booking id.

```
curl -X POST -H "Content-Type: application/json" http://localhost:8080/travel-agent/api/bookings
```
##### Output
```
{
    "flightBooking": {
        "bookingId": "e6c7365a-c269-11ed-9c44-acde48001122",
        "bookingUri": "http://localhost:8081/api/bookings/e6c7365a-c269-11ed-9c44-acde48001122",
        "expires": 300000,
        "name": "Hotel-01",
        "startTime": 1678799561752
    },
    "hotelBooking": {
        "bookingId": "e6c8c916-c269-11ed-b917-acde48001122",
        "bookingUri": "http://localhost:8082/api/bookings/e6c8c916-c269-11ed-b917-acde48001122",
        "expires": 300000,
        "name": "Flight-01",
        "startTime": 1678799561762
    },
    "message": "Successfully booked the trip",
    "status": "CONFIRMED",
    "tripBookingId": "e6ccf55e-c269-11ed-baf8-acde48001122"
}

```

If booking has to be cancelled, pass cancel parameter as part of trip booking api

```
curl -X POST -H "Content-Type: application/json" http://localhost:8080/travel-agent/api/bookings?cancel=true
```
##### Output

```
{
    "flightBooking": {
        "bookingId": "e7f7d516-c269-11ed-9c44-acde48001122",
        "bookingUri": "http://localhost:8081/api/bookings/e7f7d516-c269-11ed-9c44-acde48001122",
        "expires": 300000,
        "name": "Hotel-01",
        "startTime": 1678799563748
    },
    "hotelBooking": {
        "bookingId": "e7f9bf70-c269-11ed-b917-acde48001122",
        "bookingUri": "http://localhost:8082/api/bookings/e7f9bf70-c269-11ed-b917-acde48001122",
        "expires": 300000,
        "name": "Flight-01",
        "startTime": 1678799563761
    },
    "message": "Trip Booking has been cancelled",
    "status": "CANCELLED",
    "tripBookingId": "e7fd94d8-c269-11ed-baf8-acde48001122"
}
```

### Two-Step Trip Booking
Trip booking with 2-step process. First API reserves the booking while the status will be `RESERVED` and user can choose to either confirm or cancel the trip booking.

If user confirms and the associated flight and hotel booking is successful,
trip booking api will return the successful trip booking id with `CONFIRMED` status and associated hotel and flight booking id.
And if user cancels and the associated flight and hotel booking will be cancelled,
trip booking api will return the cancelled trip booking id with `CANCELLED` status and associated hotel and flight booking id.

##### Trip reservation
```
curl --location --request POST 'http://localhost:8080/travel-agent/api/bookings/reserve?hotelName=Hilton&flightNumber=AA2250' \
--header 'Accept: application/json' \
-v
```
##### Output
```
{
    "flightBooking": {
        "bookingId": "e566705a-c269-11ed-9c44-acde48001122",
        "bookingUri": "http://localhost:8081/api/bookings/e566705a-c269-11ed-9c44-acde48001122",
        "expires": 300000,
        "name": "Hotel-01",
        "startTime": 1678799559440
    },
    "hotelBooking": {
        "bookingId": "e5687526-c269-11ed-b917-acde48001122",
        "bookingUri": "http://localhost:8082/api/bookings/e5687526-c269-11ed-b917-acde48001122",
        "expires": 300000,
        "name": "Flight-01",
        "startTime": 1678799559453
    },
    "message": "Trip Reservation was successful",
    "status": "RESERVED",
    "tripBookingId": "e568d728-c269-11ed-baf8-acde48001122"
}
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

##### Output
```
{
    "tripBookingId": "e568d728-c269-11ed-baf8-acde48001122",
    "status": "CONFIRMED",
    "message": "Booking confirmed Successfully",
    "flightBooking": { ...
    },
    "hotelBooking": { ...
    }
}
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

##### Output
```
{
    "tripBookingId": "e568d728-c269-11ed-baf8-acde48001122",
    "status": "CANCELLED",
    "message": "Booking cancelled Successfully",
    "flightBooking": { ...
    },
    "hotelBooking": { ...
    }
}
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