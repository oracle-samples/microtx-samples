# About

TMM TCC nodejs flight sample

## Quick Start

Download the NodeJs Lib file from the official MicroTx Distribution package : https://www.oracle.com/in/database/transaction-manager-for-microservices/

Copy `oracle-microtx-24.4.1.tgz` file from `<distribution-package-dir>/lib/nodejs` to the flight folder.

```
cp <distribution-package-dir>/lib/nodejs/oracle-microtx-24.4.1.tgz ./
```

To install this dependency use:

```
$ sudo npm install
```

To run the server in development mode:

```
$ npm run dev
```

To run the server in development mode on a custom port say 8083:

```
$ npm_config_http_port=8083 npm run dev
```

To run the server in production mode:

```
$ npm run prod
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