# TMM XA sample application
- The sample application implements a scenario where a Teller application within an organization transfers money from one department to another by creating an XA transaction. The two departments in the organization are Department Helidon and Department Spring. The XA transaction is implemented by using the Transaction Manager for Microservices. Within the XA transaction, all actions such as withdraw and deposit either succeed, or they all are rolled back in case of a failure of any one or more actions.
- The Sample application uses console log messages for verifications.

### Teller Application:
- A Helidon based application. This service initiates the transactions, so it is called an XA initiator service. It provides business logic for the transaction.
- /transfers is a JAX-RS rest endpoint which is used to create a transaction.

### Department Helidon application:
- A Helidon based application. This service participates in the transactions, so it is also called as an XA participant service. It provides business logic and uses a resource manager (an RDBMS).
- In this application an Oracle Database is used as a resource manager.
- /accounts is a JAX-RS rest endpoint that interacts with the department helidon database. This endpoint is called by the teller application in the context of an XA transaction.

### Department Spring application:
- A Springboot based application. This service participates in the transactions, so it is also called as an XA participant service. It provides business logic and uses a resource manager (an RDBMS). 
- In this application an Oracle Database is used as a resource manager.
- /accounts is a JAX-RS rest endpoint that interacts with the department spring database. This endpoint is called by the teller application in the context of an XA transaction.

*******************************************************************************************************

### Demo 

#### Prerequisites
- A kubernetes cluster 
- Run TMM TCS as a service in the kubernetes cluster with service name "otmm-tcs"
- Build images for Teller, Department Helidon and Department Spring application. Instructions to create the image is in the readme file present in each application source code.
- Install the transfers helmchart.

Step 1: Check the balance in Department Helidon application
```
curl --location --request GET -header 'Authorization: Bearer <ACCESS_TOKEN>' '<ISTIO-GATEWAY-URL>/dept1/account1'
```
Sample Response
```
{ 
    accountId="account1",
    name="account1",
    amount=1000
}
```

Step 2: Check the balance Department Spring application
```
curl --location --request GET -header 'Authorization: Bearer <ACCESS_TOKEN>' '<ISTIO-GATEWAY-URL>/dept2/account2'
```
Sample Response
```
{ 
    accountId="account2",
    name="account2",
    amount=2000
}
```

Step 3: Call the teller application to initiate a transfer
```
curl --location --request POST '<ISTIO-GATEWAY-URL>/transfers' \
--header 'Content-Type: application/json' \
-header 'Authorization: Bearer <ACCESS_TOKEN>' \
--data-raw '{
    "from":"account1", 
    "to":"account2", 
    "amount": 500
}'
```
Sample Response
```
Transfer completed successfully
```
Step 3.a Verify Data Isolation during the transaction

During the XA transaction to transfer the amount, you can verify the isolation property of the transaction by passing an optional query parameter "demoIntervalSeconds" in the transfer request.
The demoIntervalSeconds property introduces a delay in seconds (equal to the value of the property) between the database updates and the transaction commit.
The maximum demoIntervalSeconds value can be 50 (seconds). 
You can initiate the transfer and then check the balances in the source and target account within the passed demoIntervalSeconds. The balances would not have changed until the transaction is committed. 
```
curl --location --request POST '<ISTIO-GATEWAY-URL>/transfers?demoIntervalSeconds=50' \
--header 'Content-Type: application/json' \
-header 'Authorization: Bearer <ACCESS_TOKEN>' \
--data-raw '{
    "from":"account1", 
    "to":"account2", 
    "amount": 500
}'
```
Step 4: Check the balance in Department Helidon application
```
curl --location --request -header 'Authorization: Bearer <ACCESS_TOKEN>' GET '<ISTIO-GATEWAY-URL>/dept1/account1'
```
Sample Response
```
{ 
    accountId="account1",
    name="account1",
    amount=500
}
```

Step 5: Check the balance Department Spring application
```
curl --location --request GET -header 'Authorization: Bearer <ACCESS_TOKEN>' '<ISTIO-GATEWAY-URL>/dept2/account2'
```
Sample Response
```
{ 
    accountId="account2",
    name="account2",
    amount=2500
}
```