## Introduction
This is a participant application (microservice) that provides an accounts service to withdraw amount from an account and deposit amount to an account.
This application used the TMM Node Js Library for XA and participates in an XA Transaction that is coordinated by the TMM Coordinator.

`/accounts` is an endpoint that interacts with the department oracle database. This endpoint will participant in the XA transaction managed by the Microservice Transaction Management Library.

`dbconfig.ts` file in the root folder can be used to provide the database configurations. `department.sql` can be used to initialise data in the database.


### Prerequisite

1. Download the NodeJs Lib file from the official MicroTx Distribution package : https://www.oracle.com/in/database/transaction-manager-for-microservices/

Copy `tmmlib-node-1.0.0.tgz` file from `<distribution-package-dir>/lib/nodejs` to the department folder.

```
cp <distribution-package-dir>/lib/nodejs/tmmlib-node-1.0.0.tgz ./
```

2. Download the Instant client Basic Package with version 21.5 or above from https://www.oracle.com/in/database/technologies/instant-client/linux-x86-64-downloads.html. Unzip the content to `Instant_Client` folder, which is present under root of department folder.


3. This application connects to an Oracle Database. If you choose to use Autonomous database, then download the client credential wallet and copy the contents into the `Database_Wallet` folder in the root of department folder.
4.Execute the SQL DML commands present in `./department.sql` file on database

5. A running instance of TMM transaction coordinator

### Build the Department Application Code on Local Machine

Set database connection parameters in `dbconfig.ts` file. 

```
export default {
    user          : process.env.DEPARTMENTDATASOURCE_USER  || "<user-name>",
    password      : process.env.DEPARTMENTDATASOURCE_PASSWORD || "<db-password>",
    connectString : process.env.DEPARTMENTDATASOURCE_URL || "<connection-string>"
};
```
Sample connection string for reference:
```
(description= (retry_count=3)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=xyz.abc.com))(connect_data=(service_name=serviceID))(security=(ssl_server_dn_match=yes))(WALLET_LOCATION = (SOURCE = (METHOD = file) (METHOD_DATA = (DIRECTORY=\"Database_Wallet\")))))
```
For constructing the connection string, please refer [node-oracledb documentation](https://node-oracledb.readthedocs.io/en/latest/user_guide/connection_handling.html#embedtns)

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

Next: Run the Bank Transfer application in the local environment. See [the readme of the Bank Transfer application](../../readme.md#run-the-bank-transfer-application-to-transfer-an-amount).

### Docker
Build the docker image.
```
- $ docker build --network host -t <image_name>:<tag> .
```
Run the docker image.
```
- $ docker run -p 8081:8081 -d <image_name>:<tag>
```

Next: Push the Docker image of the microservices, that you have built, to a remote repository. In the `values.yaml` file, provide details of all the sample application images that you have uploaded to the docker container.

### Kubernetes
To deploy on kubernetes, update the docker image and database details in `values.yaml` present in `xa/nodejs/helmcharts/transfer` and deploy.