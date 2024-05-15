# About the Teller Microservice

When you run the Bank Transfer application, the Teller microservice initiates the transactions so it is called a transaction initiator service. The user interacts with this microservice to transfer money between Departments One and Two. When a new request is created, the helper method that is exposed in the MicroTx library runs the `begin()` method for XA transaction to start the XA transaction at the Teller microservice. This microservice also contains the business logic to issue the XA commit and roll back calls. This is a Helidon microservice.

The Teller service only initiates the transaction and does not participate in it, so it does not require a resource manager.

### Prerequisite
1. Download the NodeJs Lib file from the official MicroTx Distribution package : https://www.oracle.com/in/database/transaction-manager-for-microservices/

Copy `oracle-microtx-1.0.0.tgz` file from `<distribution-package-dir>/lib/nodejs` to the teller folder.

```
cp <distribution-package-dir>/lib/nodejs/oracle-microtx-1.0.0.tgz ./
```

2. A running instance of TMM transaction coordinator

### Build the Teller Application Code on Local Machine
To install the dependencies use:

```
$ sudo npm install
```
To run the server in development mode:
```
$ npm run dev
```
To run the server in development mode on a custom port say 8085:
```
$ npm_config_http_port=8085 npm run dev
```

To run the server in production mode:
```
$ npm run prod
```
To set the department endpoints:
```
$ DEPARTMENT_A_ENDPOINT=<URL> DEPARTMENT_B_ENDPOINT=<URL> npm run <prod|dev>
```

Next: Run the Bank Transfer application in the local environment. See [the readme of the Bank Transfer application](../../readme.md#run-the-bank-transfer-application-to-transfer-an-amount).

## Docker
Build the docker image.
```
- $ docker build --network host -t <image_name>:<tag> .
```
Run the docker image.
```
- $ docker run -p 8080:8080 -d -e DEPARTMENTONEENDPOINT=<department_one_url> -e DEPARTMENTTWOENDPOINT=<department_two_url> <image_name>:<tag>
```

### Kubernetes
To deploy on kubernetes, update the docker image and database details in `values.yaml` present in `xa/nodejs/helmcharts/transfer` and deploy.