# Loan Processing Agent

This service implements a sample "loan processing agent" for workflow automation, using Python and `langgraph`. It evaluates loan applications based on simulated data and business policies.

## Features

- Stepwise evaluation of loan applications:
  - Document verification & compliance
  - Exposure validation (credit score, income, etc.)
  - Debt-to-Income (DTI) analysis
  - Loan offer generation or rejection
- Modular node definitions (see `loan_processing_agent.py`)
- Includes unit-style test script for multiple application scenarios

## Requirements

- Python 3.10+ (for local development)
- Docker or Podman (for containerized build/run)
- Helm/Minikube (optional, for cluster deployment)
- Python dependencies: see in-code install or add to requirements.txt as appropriate.

## Build Instructions

### Option 1: Build Docker Image Locally

```sh
./build.sh
```

This uses Docker/Podman by default. To use Minikube's Docker daemon:

```sh
BUILD_USING_MINIKUBE=true ./build.sh
```

### Option 2: Build Image Manually

```sh
docker build -t loan-processing-agent:latest .
```

Or for Minikube (in a Minikube-enabled shell):

```sh
minikube image build -t loan-processing-agent:latest .
```

## Run Instructions

### Local Python Run (dev/debug)

Ensure packages are present (see Dockerfile for module list):

You may want to create a venv for local dev:

```sh
python -m venv .venv
source .venv/bin/activate
pip3 install langgraph conductor-python
export CONDUCTOR_SERVER_URL=http://localhost:8080/workflow-server/api
uv run loan_processing_agent.py
```

### Run with Docker

```sh
docker run --rm loan-processing-agent:latest
```

*If built with Minikube, use `minikube image load` as needed for your cluster.*

## Testing

To run the included application/test suite:

```sh
python test.py
```

This runs a series of example loan applications and prints the decision and rationale for each.

## File Structure

- `loan_processing_agent.py` — Agent pipeline and logic
- `test.py` — Scripted tests covering various approval/rejection paths
- `build.sh` — Build helper for Docker/Minikube
- `Dockerfile` — Container recipe

## Development Notes

- If you add dependencies, reflect them in the Dockerfile and optionally in a requirements.txt.
- For production, adapt configuration and secrets handling as needed.
