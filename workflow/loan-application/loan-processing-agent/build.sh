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

# Build the Docker image for Loan Processing Agent
IMAGE_NAME="loan-processing-agent:latest"

# If minikube flag is set, use minikube for building the image
if [[ "$BUILD_USING_MINIKUBE" == "true" ]]; then
    echo "BUILD_USING_MINIKUBE is true. Building Docker image with Minikube..."
    minikube image build -t $IMAGE_NAME .
    echo "Build and Minikube image creation successful."
else
    echo "Building Docker image: $IMAGE_NAME"
    $DOCKER build -t $IMAGE_NAME .
    echo "Build complete."
fi
