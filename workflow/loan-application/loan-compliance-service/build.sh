#!/bin/bash
set -e

REBUILD="${REBUILD:-true}"
JAR_FILE="prebuilt/loan-compliance-service-0.0.1-SNAPSHOT.jar"

case "$REBUILD" in
    true|false)
        ;;
    *)
        echo "REBUILD must be either true or false." >&2
        exit 1
        ;;
esac

# Use Docker if available, else Podman
if command -v docker &>/dev/null; then
    DOCKER=docker
elif command -v podman &>/dev/null; then
    DOCKER=podman
else
    echo "Neither Docker nor Podman found in PATH. Please install one of them." >&2
    exit 1
fi

if [[ "$REBUILD" == "true" ]]; then
    echo "REBUILD is true. Building the Spring Boot project without running tests..."
    mvn clean package -DskipTests
    cp -f target/loan-compliance-service-0.0.1-SNAPSHOT.jar "$JAR_FILE"
    echo "Updated $JAR_FILE with the current build output."
elif [[ ! -f "$JAR_FILE" ]]; then
    echo "Prebuilt JAR not found: $JAR_FILE. Set REBUILD=true to create it." >&2
    exit 1
else
    echo "REBUILD is false. Reusing existing $JAR_FILE."
fi

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
