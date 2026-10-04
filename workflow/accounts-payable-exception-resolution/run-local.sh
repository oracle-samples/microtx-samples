#!/usr/bin/env bash
# Start the AP sample's local service dependencies. No Docker required.
set -euo pipefail

cd "$(dirname "$0")"

VENV_DIR=".venv"
PYTHON="$VENV_DIR/bin/python"
RUN_DIR=".local-run"

pid_file() { printf '%s/%s.pid' "$RUN_DIR" "$1"; }
log_file() { printf '%s/%s.log' "$RUN_DIR" "$1"; }

is_running() {
  local file
  file="$(pid_file "$1")"
  [ -f "$file" ] && kill -0 "$(<"$file")" 2>/dev/null
}

install_bank_mock_if_needed() {
  if [ -x "$PYTHON" ]; then
    return
  fi

  echo "Creating .venv and installing the bank-mock dependency..."
  python3 -m venv "$VENV_DIR"
  "$PYTHON" -m pip install -r services/bank-mock/requirements.txt
}

require_database_settings() {
  local variable
  for variable in AP_DATABASE_URL AP_DATABASE_USERNAME AP_DATABASE_PASSWORD PAYMENT_DATABASE_URL PAYMENT_DATABASE_USERNAME PAYMENT_DATABASE_PASSWORD; do
    if [ -z "${!variable:-}" ]; then
      echo "Set $variable before starting the XA participants. See README.md." >&2
      exit 1
    fi
  done
}

needs_build() {
  local dir="$1" jar="$2"
  [ ! -f "$jar" ] || find "$dir/src" "$dir/pom.xml" -type f -newer "$jar" -print -quit | grep -q .
}

build_java_service() {
  local name="$1" service_dir="$2" jar="$3"
  if needs_build "$service_dir" "$jar"; then
    echo "Building $name..."
    (cd "$service_dir" && mvn -q -DskipTests package)
  fi
}

start_java_service() {
  local name="$1" jar="$2" port="$3"
  if is_running "$name"; then
    echo "$name already running on port $port."
    return
  fi
  java -jar "$jar" \
    >"$(log_file "$name")" 2>&1 &
  echo $! >"$(pid_file "$name")"
  echo "Started $name on http://127.0.0.1:$port"
}

start_bank_mock() {
  if is_running bank-mock; then
    echo "bank-mock already running on port 8085."
    return
  fi

  # A previous runner may have been interrupted after bank-mock started but
  # before its PID file survived. Adopt that known service instead of trying to
  # bind a second process to 8085.
  local existing_pid
  existing_pid="$(lsof -tiTCP:8085 -sTCP:LISTEN 2>/dev/null | head -n 1 || true)"
  if [ -n "$existing_pid" ]; then
    if curl -fsS --max-time 2 http://127.0.0.1:8085/healthz 2>/dev/null | grep -q '"service":"bank-mock"'; then
      echo "$existing_pid" >"$(pid_file bank-mock)"
      echo "Adopted existing bank-mock on http://127.0.0.1:8085"
      return
    fi
    echo "Port 8085 is already used by a process that is not this sample's bank-mock (PID $existing_pid)." >&2
    return 1
  fi

  "$PYTHON" -m uvicorn main:app --app-dir services/bank-mock --host 127.0.0.1 --port 8085 \
    >"$(log_file bank-mock)" 2>&1 &
  echo $! >"$(pid_file bank-mock)"
  sleep 1
  if ! is_running bank-mock; then
    echo "bank-mock exited during startup. Recent log output:" >&2
    tail -n 40 "$(log_file bank-mock)" >&2 || true
    rm -f "$(pid_file bank-mock)"
    return 1
  fi
  echo "Started bank-mock on http://127.0.0.1:8085"
}

stop_services() {
  for service in ap-backend payment-service bank-mock; do
    if is_running "$service"; then
      kill "$(<"$(pid_file "$service")")"
      echo "Stopped $service."
    fi
    rm -f "$(pid_file "$service")"
  done
}

if [ "${1:-}" = "stop" ]; then
  stop_services
  exit 0
fi

if [ -n "${1:-}" ]; then
  echo "Usage: ./run-local.sh [stop]" >&2
  exit 1
fi

require_database_settings
install_bank_mock_if_needed
mkdir -p "$RUN_DIR"
build_java_service ap-backend services/ap-backend services/ap-backend/target/ap-backend.jar
build_java_service payment-service services/payment-service services/payment-service/target/payment-service.jar
start_java_service ap-backend services/ap-backend/target/ap-backend.jar 8083
start_java_service payment-service services/payment-service/target/payment-service.jar 8084
start_bank_mock

echo "Local AP sample services have been launched. Logs: $RUN_DIR/"
