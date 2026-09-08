#!/usr/bin/env bash
# Helper wrapper around the sample. Everything here is a thin shortcut over
# docker compose, curl and pytest - nothing is hidden from you.
set -euo pipefail

cd "$(dirname "$0")"

AP=${AP_BACKEND_URL:-${AP_URL:-http://localhost:8083}}
PAYMENT=${PAYMENT_URL:-http://localhost:8084}
BANK=${BANK_URL:-http://localhost:8085}

usage() {
  cat <<'EOF'
Usage: ./run.sh <command>

  up            Build and start all three services
  down          Stop and remove them
  logs [svc]    Tail logs
  health        Check all three health endpoints
  case <file>   Replay one case end to end, e.g. ./run.sh case 03-bank-change.json
  boundary      Run the static planner-boundary lint (no services needed)
  test          Run the full test suite against the running stack
  reset         Restart the stack, clearing all in-memory state
EOF
}

compose() { docker compose "$@"; }

case "${1:-}" in
  up)
    compose up --build -d
    echo "Waiting for services..."
    for _ in $(seq 1 30); do
      if curl -sf "$AP/healthz" >/dev/null 2>&1; then break; fi
      sleep 1
    done
    "$0" health
    ;;

  down)
    compose down
    ;;

  logs)
    shift || true
    compose logs -f "$@"
    ;;

  health)
    for pair in "ap-backend $AP" "payment-service $PAYMENT" "bank-mock $BANK"; do
      set -- $pair
      printf '%-18s ' "$1"
      curl -sf "$2/healthz" || printf 'DOWN'
      printf '\n'
    done
    ;;

  case)
    FILE=${2:-03-bank-change.json}
    [ -f "test-data/$FILE" ] || { echo "No such case: test-data/$FILE"; exit 1; }
    python3 - "$FILE" <<'PY'
import json, sys
sys.path.insert(0, "tests")  # run.sh has already cd'd to the sample root
from test_replay_cases import run_case, load_case, APPROVED

case = load_case(sys.argv[1])
# Any case that escalates gets an approving reviewer, so you can see policy
# run again afterwards rather than stopping at the human task.
result = run_case(case, human_decision=APPROVED)
print(json.dumps({
    "operationId": result["operationId"],
    "invoiceId": result["invoiceId"],
    "plannerStatus": result["plannerStatus"],
    "precheck": result["precheck"]["exceptionContext"],
    "evidence": result.get("decision", {}).get("evidence", []),
    "unresolvedRisks": result.get("decision", {}).get("unresolvedRisks", []),
    "evidenceVerified": result.get("verification", {}).get("valid"),
    "verificationReason": result.get("verification", {}).get("reason"),
    "humanDecision": result["humanDecision"],
    "policyStatus": result["policyStatus"],
    "policyReasons": result.get("policyReasons"),
    "paymentScheduled": result["paymentScheduled"],
    "settlementCallTimedOut": result.get("settlementCallTimedOut"),
    "settlementStatus": result["settlementStatus"],
    "outcome": result["outcome"],
}, indent=2))
PY
    ;;

  boundary)
    python3 tests/test_harness_boundary.py
    ;;

  test)
    python3 -m pytest tests/ -v
    ;;

  reset)
    compose restart
    sleep 5
    "$0" health
    ;;

  *)
    usage
    exit 1
    ;;
esac
