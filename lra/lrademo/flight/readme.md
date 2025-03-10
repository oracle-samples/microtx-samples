# About
TMM LRA demo Flight TypeScript microservice build on Node.js Express.
Default TRM LRA coordinator URL is "http://localhost:9000/api/v1/lra-coordinator"

## Quick Start

Download the NodeJs Lib file from the official MicroTx Distribution package : https://www.oracle.com/in/database/transaction-manager-for-microservices/

Copy `oracle-microtx-24.4.1.tgz` file from `<distribution-package-dir>/lib/nodejs` to the flight folder.

```
cp <distribution-package-dir>/lib/nodejs/oracle-microtx-24.4.1.tgz ./
```

To install this dependency use:

```
npm install
```
To run the server in development mode:
```
npm run dev
```
To run the server in production mode:
```
npm run prod
```
To run the server with different TRM coordinator assign the URL to ORACLE_TMM_TCS_URL environment variable:
```
export ORACLE_TMM_TCS_URL=<URL>
npm run <prod|dev>
```
To create a docker image:
```
docker image build -t=<image_name> .
```
To run the docker image:
```
docker container run <image_name>
```
To run the docker image with different TRM coordinator assign the URL to ORACLE_TMM_TCS_URL environment variable:
```
docker container run -e ORACLE_TMM_TCS_URL=<URL> <image_name>
```
To change the Max Booking Count:
```
#set the count value as required

curl --location --request PUT 'http://localhost:8083/flightService/api/maxbookings?count=7'
```