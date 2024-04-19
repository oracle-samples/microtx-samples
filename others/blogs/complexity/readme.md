## Prerequisites
1. All microservices are based on JDK 17+
2. Two Oracle Databases. One for `department1` microservice and other for `department2` microservice.
3. Execute DDL statements on database with content from the file `/BlogXX/blogType/department1/department_DDL.sql` in `department-1` database and `/BlogXX/blogType/department2/department_DDL.sql` in `department-2` database.

## Curls

### Transfer
```shell
curl --location 'http://localhost:8080/transfers/transfer' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--d '{
    "from": "account1",
    "to": "account2",
    "amount": 2
}'
```
While, `account1` is the account ID for source account and `account2` is the account-id of destination account

### Get balance from Department1 microservice 
```shell
curl --location 'http://localhost:8081/accounts/account1' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json'
```
While, `account1` is the account ID

### Get balance from Department2 microservice
```shell
curl --location 'http://localhost:8082/accounts/account2' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json'
```
While, `account2` is the account ID