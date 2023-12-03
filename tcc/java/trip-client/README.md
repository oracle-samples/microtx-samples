# About
MicroTx TCC demo Trip-Client application.

## Build and run

With JDK11+

```
mvn clean package
```

## Quick Start

To run the application:
```
export TRAVEL_AGENT_SERVICE_URL=<travel-agent-url>
example: 
export TRAVEL_AGENT_SERVICE_URL=http://localhost:8080/travel-agent/api/

example when travel-agent-service is deployed in kubernetes:
export TRAVEL_AGENT_SERVICE_URL=http://<Istio/Kubernetes-IP>/travel-agent/api/

If authentication or authorization is enabled in the kubernetes cluster, set the access token and refresh token as environment variables.
export ACCESS_TOKEN=<access_token>
export REFRESH_TOKEN=<refresh_token>

java -jar trip-client.jar
```
