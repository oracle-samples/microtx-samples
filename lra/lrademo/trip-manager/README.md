# About
TMM LRA demo Trip manager helidon application.
Default TRM LRA coordinator URL is "http://localhost:9000/api/v1/lra-coordinator"
## Quick Start
To run build:

```
mvn clean package
```

To run the application:
```
java -jar trip-manager.jar
```
To run the application with different TRM coordinator assign the URL to mp.lra.coordinator.url system variable:
```
java -jar -Dmp.lra.coordinator.url=<url> trip-manager.jar
```
To create a docker image:
```
docker image build -t=<image_name> .
```
To run the docker image:
```
docker container run <image_name>
```
To run the docker image with different TRM coordinator assign the URL to MP_LRA_COORDINATOR_URL environment variable:
```
docker container run -e MP_LRA_COORDINATOR_URL=<URL> <image_name>
```