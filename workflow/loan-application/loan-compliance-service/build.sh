#!/bin/bash
set -e

# Use Docker if available, else Podman
if command -v docker &>/dev/null; then
    DOCKER=docker
elif command -v podman &>/dev/null; then
    DOCKER=podman
else
    echo "Neither Docker nor Podman found in PATH. Please install one of them." >&2
    exit 1
fi

# Build the Spring Boot project without running tests
./mvnw clean package -DskipTests

# If minikube flag is set, use minikube for building the image
if [[ "$BUILD_USING_MINIKUBE" == "true" ]]; then
    echo "BUILD_USING_MINIKUBE is true. Building Docker image with Minikube..."
    minikube image build -t loan-compliance-service:latest .
    echo "Build and Minikube image creation successful."
else
    # Build the Docker image
    $DOCKER build -t loan-compliance-service:latest .
    echo "Build and Docker image creation successful."
fi
