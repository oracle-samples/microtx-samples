# Hotel Booking Application

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
docker build -t hotel-booking-py:1.0 .
```

## To start the application with Docker

```
docker run --rm -p 8081:8081 hotel-booking-py:1.0
```