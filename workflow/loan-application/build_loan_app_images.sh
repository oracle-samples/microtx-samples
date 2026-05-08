#!/usr/bin/env bash
set -euo pipefail

# Build loan-application service images and save compressed artifacts per service.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

DEFAULT_VERSION="26.1.1"
DEFAULT_OUTPUT_DIR_NAME="offline_docker_image"
DEFAULT_SERVICES=(
  "doc-process-mcp-server"
  "loan-compliance-service"
  "loan-processing-agent"
  "notification-service"
  "ocr-microservice"
)

VERSION="$DEFAULT_VERSION"
OUTPUT_DIR_NAME="$DEFAULT_OUTPUT_DIR_NAME"
SERVICES_CSV=""

SERVICES=("${DEFAULT_SERVICES[@]}")

usage() {
  cat <<'USAGE'
Usage:
  ./build_loan_app_images [options]

Options:
  -v, --version <tag>           Docker image tag to build/save (default: 26.1.1)
  -o, --output-dir-name <name>  Per-service artifact directory name (default: offline_docker_image)
  -s, --services <csv>          Comma-separated services to build (default: DEFAULT_SERVICES)
  -h, --help                    Show this help

Examples:
  ./build_loan_app_images
  ./build_loan_app_images -v 26.1.1
  ./build_loan_app_images -v 26.1.1 -o offline_docker_image
  ./build_loan_app_images -s ocr-microservice
  ./build_loan_app_images -s doc-process-mcp-server,ocr-microservice

Output per service:
  <service>/<output-dir-name>/<service>-<arch>.tar.gz
USAGE
}

detect_container_engine() {
  if command -v docker >/dev/null 2>&1; then
    echo "docker"
  elif command -v podman >/dev/null 2>&1; then
    echo "podman"
  else
    echo ""
  fi
}

detect_arch_suffix() {
  local machine_arch
  machine_arch="$(uname -m)"

  case "$machine_arch" in
    x86_64|amd64)
      echo "amd"
      ;;
    arm64|aarch64)
      echo "arm"
      ;;
    *)
      echo "Error: Unsupported architecture '$machine_arch'. Supported: x86_64/amd64 or arm64/aarch64." >&2
      exit 1
      ;;
  esac
}

build_selected_services() {
  local csv="$1"
  IFS=',' read -r -a requested_services <<< "$csv"

  local selected=()
  local svc

  for svc in "${requested_services[@]}"; do
    svc="$(echo "$svc" | xargs)"
    if [[ -z "$svc" ]]; then
      continue
    fi

    local valid="false"
    local allowed
    for allowed in "${DEFAULT_SERVICES[@]}"; do
      if [[ "$svc" == "$allowed" ]]; then
        valid="true"
        break
      fi
    done

    if [[ "$valid" != "true" ]]; then
      echo "Error: Unknown service '$svc'. Allowed values are: ${DEFAULT_SERVICES[*]}" >&2
      exit 1
    fi

    selected+=("$svc")
  done

  if [[ ${#selected[@]} -eq 0 ]]; then
    echo "Error: --services was provided but no valid services were parsed." >&2
    exit 1
  fi

  SERVICES=("${selected[@]}")
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -v|--version)
      VERSION="${2:-}"
      if [[ -z "$VERSION" ]]; then
        echo "Error: --version requires a value" >&2
        usage
        exit 1
      fi
      shift 2
      ;;
    -o|--output-dir-name)
      OUTPUT_DIR_NAME="${2:-}"
      if [[ -z "$OUTPUT_DIR_NAME" ]]; then
        echo "Error: --output-dir-name requires a value" >&2
        usage
        exit 1
      fi
      shift 2
      ;;
    -s|--services)
      SERVICES_CSV="${2:-}"
      if [[ -z "$SERVICES_CSV" ]]; then
        echo "Error: --services requires a value" >&2
        usage
        exit 1
      fi
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Error: Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -n "$SERVICES_CSV" ]]; then
  build_selected_services "$SERVICES_CSV"
fi

ENGINE="$(detect_container_engine)"
if [[ -z "$ENGINE" ]]; then
  echo "Error: Neither docker nor podman found. Cannot build/save images." >&2
  exit 1
fi

ARCH_SUFFIX="$(detect_arch_suffix)"

echo "Container engine : $ENGINE"
echo "Image version    : $VERSION"
echo "Output dir name  : $OUTPUT_DIR_NAME"
echo "Detected arch    : $ARCH_SUFFIX"
echo "Services         : ${SERVICES[*]}"
echo

for service in "${SERVICES[@]}"; do
  service_dir="$SCRIPT_DIR/$service"

  if [[ ! -d "$service_dir" ]]; then
    echo "Error: Service directory does not exist: $service_dir" >&2
    exit 1
  fi

  if [[ ! -f "$service_dir/Dockerfile" ]]; then
    echo "Error: Dockerfile not found in: $service_dir" >&2
    exit 1
  fi

  image_name="${service}:${VERSION}"
  output_dir="$service_dir/$OUTPUT_DIR_NAME"
  archive_path="$output_dir/${service}-${ARCH_SUFFIX}.tar.gz"

  mkdir -p "$output_dir"

  echo "============================================================"
  echo "Building service : $service"
  echo "Image            : $image_name"
  echo "Source           : $service_dir"
  echo "Archive          : $archive_path"

  "$ENGINE" build -t "$image_name" "$service_dir"

  # Save and compress image for offline transfer/storage.
  "$ENGINE" save "$image_name" | gzip -c > "$archive_path"

  echo "Done: $service"
  echo
done

echo "All loan application images built and archived successfully."
