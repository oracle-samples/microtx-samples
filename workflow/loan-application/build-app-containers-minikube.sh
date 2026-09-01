#!/usr/bin/env bash
set -Eeuo pipefail

# Build all loan-application images directly in the active Minikube profile.
BUILD_USING_MINIKUBE=true
REINITIALIZE="${REINITIALIZE:-false}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${TMPDIR:-/tmp}/build-app-containers-minikube-$(date +%Y%m%d-%H%M%S)-$$.log"
CURRENT_SERVICE="preflight"
SERVICES=(
  "doc-process-mcp-server"
  "loan-compliance-service"
  "loan-processing-agent"
  "notification-service"
  "ocr-microservice"
)

if ! : > "$LOG_FILE"; then
  echo "Error: unable to create log file: $LOG_FILE" >&2
  exit 1
fi

log() {
  local level="$1"
  shift
  printf '%s [%s] %s\n' "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$level" "$*" | tee -a "$LOG_FILE"
}

fail() {
  log ERROR "$*"
  exit 1
}

handle_error() {
  local exit_code="$1"
  local line_number="$2"
  local failed_command="$3"

  trap - ERR
  log ERROR "Command failed with exit code $exit_code while processing $CURRENT_SERVICE at line $line_number: $failed_command"
  log ERROR "Execution stopped. Review log file: $LOG_FILE"
  exit "$exit_code"
}

trap 'handle_error "$?" "$LINENO" "$BASH_COMMAND"' ERR

log INFO "Starting Minikube image build. Log file: $LOG_FILE"
log INFO "REINITIALIZE=$REINITIALIZE"

if ! command -v minikube >/dev/null 2>&1; then
  fail "minikube is required to build loan-application images."
fi

case "$REINITIALIZE" in
  true|false)
    ;;
  *)
    fail "REINITIALIZE must be either true or false."
    ;;
esac

MINIKUBE_IMAGES=""

refresh_minikube_images() {
  local image_list

  if image_list="$({ trap - ERR; minikube image ls; } 2>&1)"; then
    MINIKUBE_IMAGES="$image_list"
  else
    log ERROR "$image_list"
    fail "Unable to list images in the active Minikube profile."
  fi
}

image_exists() {
  local image_name="$1"

  printf '%s\n' "$MINIKUBE_IMAGES" | grep -Eq "(^|/)${image_name}([[:space:]]|$)"
}

run_logged() {
  local command_status

  if "$@" 2>&1 | tee -a "$LOG_FILE"; then
    return 0
  else
    command_status="${PIPESTATUS[0]}"
    fail "Command failed with exit code $command_status while processing $CURRENT_SERVICE: $*"
  fi
}

build_service() {
  local service="$1"
  local service_dir="$SCRIPT_DIR/$service"
  local image_name="${service}:latest"

  CURRENT_SERVICE="$service"

  if [[ ! -x "$service_dir/build.sh" ]]; then
    fail "Build script not found or not executable: $service_dir/build.sh"
  fi

  refresh_minikube_images
  if image_exists "$image_name"; then
    if [[ "$REINITIALIZE" == "false" ]]; then
      log INFO "Skipping $service: $image_name already exists in Minikube."
      log INFO "-------------------------------------"
      return
    fi
    log WARN "REINITIALIZE is true. Rebuilding existing image $image_name."
  else
    log INFO "$image_name does not exist in Minikube. Building it."
  fi

  log INFO "Starting Minikube build for $service."
  pushd "$service_dir" >/dev/null
  run_logged env BUILD_USING_MINIKUBE="$BUILD_USING_MINIKUBE" ./build.sh
  popd >/dev/null
  log INFO "$service Minikube build complete."
  log INFO "-------------------------------------"
}

for service in "${SERVICES[@]}"; do
  build_service "$service"
done

CURRENT_SERVICE="completion"
log INFO "All loan-application Minikube builds completed successfully."
