#!/bin/bash
set -e

# Build the Spring Boot project without running tests
./gradlew clean build -x test

# Build the Docker image
docker build -t notification-service:latest .

echo "Build and Docker image creation successful."
