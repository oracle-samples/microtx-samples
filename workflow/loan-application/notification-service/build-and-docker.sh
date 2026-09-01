#!/bin/bash
set -e

# Build the Spring Boot project without running tests
mvn clean package -DskipTests

# Keep the JAR consumed by the Dockerfile in sync with the current build output.
cp target/notification-service-0.0.1.jar prebuilt/notification-service-0.0.1.jar

# Build the Docker image
docker build -t notification-service:latest .

echo "Build and Docker image creation successful."
