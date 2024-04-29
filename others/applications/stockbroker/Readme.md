## Introduction
Bank Application to demonstrate distributed Transactions using XA protocol using MicroTx coordinator.

## Prerequisite
This sample application deployment requires Kubernetes environment and Keycloak being the identity provider.

**MicroTx** must be deployed on the kubernetes cluster. Please refer the steps mentioned for kubernetes deployment in this document https://docs.oracle.com/en/database/oracle/transaction-manager-for-microservices/22.3/tmmdg/install.html

### Identity Provider
Application authorizes the bank customers and bank admin based on the roles. As prerequisite, user needs to create two different roles in Identity provider (Keycloak in this case) and associate respective users to it.

Reference Kuberenetes deployment can be found here: https://raw.githubusercontent.com/keycloak/keycloak-quickstarts/21.1.1/kubernetes-examples/keycloak.yaml

Role names must be as follows:
```
BANK_ADMIN_ROLE
BANK_CUSTOMER_ROLE
```

#### Keycloak specific settings
Client must be configured with below settings 

```
clientId: bankapp
```

```
Access settings:
   Root URL: http://<Istio-IP>/*
   Valid redirect URIs : http://<Istio-IP>/*
   Valid post logout redirect URIs : http://<Istio-IP>/*
   Admin URL : http://<Istio-IP>/*

Capability config:
   Client authentication : enabled
   Authentication flow : Standard flow , Direct access grants, Service accounts roles

Logout settings
   Front channel logout : enabled
   Backchannel logout session required : enabled

Client Scopes:
   Token Mapper: Client IP Address, Client ID, Client Host
```

Client Scopes
```
Client Scopes: roles 
   Mappers (add and re-save): realm roles, client roles 
```
Keycloak Endpoints

User can extract `issuerURL` from Keycloak user interface
```
Realm Settings :
   Endpoints : Click : OpenID Endpoint Configuration
```

User can extract  `clientSecret` from Keycloak user interface
```
`Clients` menu : Click the `client-id` which was created earlier
Select `Credentials` tab, then copy the value from `Client secret` field  
```

#### Alternative keycloak option : Sample realm configuration also can be directly imported and modify parameters as per the environment
Configuration file exported in this approach is using the keycloak image version : `quay.io/keycloak/keycloak:21.1.1`
Kuberenetes deployment can be found here: https://raw.githubusercontent.com/keycloak/keycloak-quickstarts/21.1.1/kubernetes-examples/keycloak.yaml


1. Login to KeyCloak
2. Create new `Realm` with name `MicroTx-BankApp`
3. From `Resource File` field click `Browse` menu and upload the file present in the `keycloak/MicroTx-BankApp-realm.json` and click `Create`
   This step creates the necessary Users and associate the roles
4. Execute below command to get the istio-ingressgateway external IP and copy the external IP
   `kubectl get svc -n istio-system`
5. From Keycloak interface, select `Clients` menu and from `Clients list` tab open `microtx-bankapp` and update the below settings with right istio-ip copied in previous step
   ```
   Access settings:
   Root URL: http://<Istio-IP>/*
   Valid redirect URIs : http://<Istio-IP>/*
   Valid post logout redirect URIs : http://<Istio-IP>/*
   Admin URL : http://<Istio-IP>/*
   ```
6. From Keycloak interface, select `Realm Settings`, update the `Frontend URL` with the right keycloak IP address
7. Same can be updated in the helmchart values.yaml
   Example:
```
bankapp:
  UserBanking:
    name: user-banking
    host: user-banking
    version: v1
    image: user-banking:1.0
    gatewayUriPrefix: /bankapp
    rewriteUriPrefix: /bankapp
    destinationHost: user-banking
    security:
      clientId: microtx-bankapp
      clientSecret: KcQY9TI90XJB6NOPiejbFIOGvrXsioeh 
      issuerURL: http://10.104.93.168:8080/realms/MicroTx-BankApp
      logoutRedirectURL: http://10.111.38.170/bankapp
```
PS: `clientSecret` and `issuerURL` can be extracted as mentioned in previous approach

### Build Bank Application Services
Please follow the `readme.md` file on all four services, which guides on building the application docker image and pushing it to the container registry.

Services to be built
```
CoreBanking
BranchBanking
StockBroker
UserBanking
```

### Service Port configuration
These service ports are predefined in the Helm chart
```
UserBanking : 9090
CoreBanking : 9091
StockBroker : 9092

BranchBanking : Starts from 9095
```

### Helm Chart
Helm chart for this Bank application can be found under current directory with name `Helmcharts`.

Provide the required values mentioned in `<tag>`

## Kubernetes Deployment
From terminal change the directory to `Helmcharts` directory and run the following command to install the helm chart
```
helm install bankapp --namespace otmm bankapp/ --values bankapp/values.yaml
```

To uninstall the bankapp
```
helm uninstall bankapp --namespace otmm
```

### Note:
If you are using the Helm Chart for coordinator provided in distribution package and if JWT `authentication` is enabled on tmm/values.yaml, then modify as below

Edit `helmcharts/tmm/templates/auth.yaml` and add `/bank*` to be excluded in `AuthorizationPolicy`  

```
  rules:
    - from:
        - source:
            notRequestPrincipals: ["*"]
      to:
        - operation:
            notPaths: ["/console*", "/bank*"]
```

## Demo
Open URL `http://<Istio-IP>/bankapp/` and proceed with keycloak authentication, further authentication, user will be redirected to Bank sample application. 